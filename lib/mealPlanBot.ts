// lib/mealPlanBot.ts
import { sendWhatsAppMessage } from "./botLogic";
import { buildText, buildButtons } from "./mealPlanUIBuilders";
import OpenAI from "openai";
import { saveUserMealPlan, saveMealReminder, activateSubscription } from "./mealPlanDB";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --------------------------------------------------
// UNIVERSAL SAFE SENDER (splits messages >900 chars)
// --------------------------------------------------
async function sendSafeMessage(payload: any) {
  if (payload.text && payload.text.body) {
    const text = payload.text.body;
    if (text.length <= 900) {
      return sendWhatsAppMessage(payload);
    }

    // split into chunks of 900 chars
    const chunks = [];
    for (let i = 0; i < text.length; i += 900) {
      chunks.push(text.substring(i, i + 900));
    }

    // send chunks one by one
    for (const c of chunks) {
      await sendWhatsAppMessage(buildText(payload.to, c));
    }
    return;
  }

  // if not text (buttons/carousel) — send normally
  return sendWhatsAppMessage(payload);
}

// --------------------------------------------------
// USER STATE MACHINE
// --------------------------------------------------

type MealStep =
  | "START"
  | "ASK_GOAL"
  | "ASK_DIET"
  | "ASK_MEALS"
  | "ASK_ALLERGIES"
  | "ASK_CUISINE"
  | "SHOW_PLAN"
  | "WAITING_PAYMENT"
  | "ACTIVE";

type MealState = {
  step: MealStep;
  goal?: string;
  diet?: string;
  mealsPerDay?: number;
  allergies?: string;
  cuisine?: string;
  planText?: string;
};

export const userMealStates = new Map<string, MealState>();

// MAIN HANDLER
export async function handleMealPlanIncoming({ from, userMsg }: { from: string; userMsg: string }) {
  const to = (from || "").replace("+", "");
  if (!userMealStates.has(to)) userMealStates.set(to, { step: "START" });
  const state = userMealStates.get(to)!;

  const lower = (userMsg || "").trim().toLowerCase();
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // ENTRY
  if (postback === "ACTION_PLAN_MEAL" || lower.includes("plan a meal") || lower.includes("plan meal")) {
    state.step = "ASK_GOAL";

    await sendSafeMessage(
      buildButtons(to, "Let's personalise your meal plan. Choose your goal:", [
        { id: "GOAL_weight_loss", title: "Weight Loss" },
        { id: "GOAL_muscle_gain", title: "Muscle Gain" },
        { id: "GOAL_maintenance", title: "Maintenance" },
      ])
    );
    return;
  }

  // ASK_GOAL
  if (state.step === "ASK_GOAL") {
    if (postback?.startsWith("GOAL_")) {
      state.goal = postback.replace("GOAL_", "");
      state.step = "ASK_DIET";

      await sendSafeMessage(
        buildButtons(to, "Choose diet type:", [
          { id: "DIET_veg", title: "Vegetarian" },
          { id: "DIET_nonveg", title: "Non-Veg" },
          { id: "DIET_eggetarian", title: "Eggetarian" },
        ])
      );
      return;
    }
    return;
  }

  // ASK_DIET
  if (state.step === "ASK_DIET") {
    if (postback?.startsWith("DIET_")) {
      state.diet = postback.replace("DIET_", "");
      state.step = "ASK_MEALS";

      await sendSafeMessage(
        buildButtons(to, "Meals per day:", [
          { id: "MEALS_2", title: "2 Meals" },
          { id: "MEALS_3", title: "3 Meals" },
          { id: "MEALS_4", title: "4 Meals" },
        ])
      );
      return;
    }
    return;
  }

  // ASK_MEALS
  if (state.step === "ASK_MEALS") {
    if (postback?.startsWith("MEALS_")) {
      state.mealsPerDay = parseInt(postback.replace("MEALS_", ""), 10);
      state.step = "ASK_ALLERGIES";

      await sendSafeMessage(
        buildButtons(to, "Any allergies?", [
          { id: "ALLERGIES_none", title: "None" },
          { id: "ALLERGIES_common", title: "Common Allergies" },
          { id: "ALLERGIES_custom", title: "Type Manually" },
        ])
      );
      return;
    }
    return;
  }

  // ASK_ALLERGIES
  if (state.step === "ASK_ALLERGIES") {
    if (postback === "ALLERGIES_none") {
      state.allergies = "None";
    } else if (postback === "ALLERGIES_common") {
      state.allergies = "Dairy, Gluten, Peanuts (User selected common)";
    } else if (postback === "ALLERGIES_custom") {
      state.allergies = userMsg;
    } else {
      // if typed directly
      state.allergies = userMsg;
    }

    state.step = "ASK_CUISINE";

    await sendSafeMessage(
      buildButtons(to, "Preferred cuisine?", [
        { id: "CUS_indian", title: "Indian" },
        { id: "CUS_continental", title: "Continental" },
        { id: "CUS_no_pref", title: "No preference" },
        { id: "CUS_custom", title: "Type manually" },
      ])
    );

    return;
  }

  // ASK_CUISINE
  if (state.step === "ASK_CUISINE") {
    if (postback?.startsWith("CUS_")) {
      if (postback === "CUS_custom") {
        state.cuisine = userMsg;
      } else if (postback === "CUS_no_pref") {
        state.cuisine = "No preference";
      } else {
        state.cuisine = postback.replace("CUS_", "");
      }
    } else {
      state.cuisine = userMsg;
    }

    // GENERATE PLAN
    const planText = await generateMealPlanAI({
      goal: state.goal!,
      diet: state.diet!,
      mealsPerDay: state.mealsPerDay!,
      allergies: state.allergies!,
      cuisine: state.cuisine!,
    });

    state.planText = planText;
    state.step = "SHOW_PLAN";

    await saveUserMealPlan(to, {
      goal: state.goal!,
      diet: state.diet!,
      mealsPerDay: state.mealsPerDay!,
      allergies: state.allergies!,
      cuisine: state.cuisine!,
      planText,
      priceWeekly: 399,
      priceMonthly: 999,
    });

    await sendSafeMessage(
      buildButtons(
        to,
        `Here is your meal plan:\n\n${planText}\n\nWeekly: ₹399 | Monthly: ₹999\nSubscribe for daily reminders?`,
        [
          { id: "SUB_subscribe", title: "Subscribe" },
          { id: "SUB_later", title: "Not now" },
        ]
      )
    );
    return;
  }

  // SHOW_PLAN (subscription)
  if (state.step === "SHOW_PLAN") {
    if (postback === "SUB_subscribe") {
      state.step = "WAITING_PAYMENT";
      await sendSafeMessage(
        buildText(to, "Great! Click the pay link and then reply 'PAID' to activate your reminders.")
      );
      return;
    }

    if (postback === "SUB_later") {
      userMealStates.delete(to);
      await sendSafeMessage(buildText(to, "No problem! Type *Plan a meal* anytime."));
      return;
    }
  }

  // WAITING_PAYMENT
  if (state.step === "WAITING_PAYMENT") {
    if (lower === "paid") {
      await sendSafeMessage(buildText(to, "Payment received. Activating your reminders..."));
    }
    return;
  }

  // fallback
  await sendSafeMessage(buildText(to, "Type *Plan a meal* to begin your personalised plan."));
}

// AI PLAN GENERATION


export async function generateMealPlanAI({
  goal,
  diet,
  mealsPerDay,
  allergies,
  cuisine,
}: any) {
  const prompt = `
You are a professional nutritionist.
Create a ${mealsPerDay}-meal plan for:
Goal: ${goal}
Diet: ${diet}
Allergies: ${allergies}
Cuisine: ${cuisine}

Format:
Breakfast:
Snack:
Lunch:
Snack:
Dinner:
Include calories per meal + total.
Keep it concise and practical.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  const output =
  res.choices?.[0]?.message?.content?.trim() ??
  "Unable to generate plan.";

return output;

}


// Activate subscription after payment


export async function activateMealPlanForUser(userId: string) {
  await activateSubscription(userId);
  await saveMealReminder(userId, { breakfast: "09:00", lunch: "13:00", dinner: "20:00" });

  await sendSafeMessage(buildText(userId, "Your meal plan subscription is now active!"));
  userMealStates.delete(userId);
}
