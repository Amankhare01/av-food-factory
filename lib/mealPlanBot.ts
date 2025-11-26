// lib/mealPlanBot.ts
import { sendWhatsAppMessage } from "./botLogic";
import { buildText, buildButtons } from "./mealPlanUIBuilders";
import OpenAI from "openai";
import { saveUserMealPlan, saveMealReminder, activateSubscription } from "./mealPlanDB";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --------------------------------------------------
// SAFE SENDER (splits long text)
// --------------------------------------------------
async function sendSafeMessage(payload: any) {
  if (payload?.text?.body) {
    const text = payload.text.body;

    if (text.length <= 900) return sendWhatsAppMessage(payload);

    const chunks = [];
    for (let i = 0; i < text.length; i += 900) {
      chunks.push(text.slice(i, i + 900));
    }

    for (const chunk of chunks) {
      await sendWhatsAppMessage(buildText(payload.to, chunk));
    }
    return;
  }

  return sendWhatsAppMessage(payload);
}

// --------------------------------------------------
// STATE MACHINE
// --------------------------------------------------
type MealStep =
  | "START"
  | "ASK_GOAL"
  | "ASK_DIET"
  | "ASK_MEALS"
  | "ASK_ALLERGIES"
  | "ASK_ALLERGIES_MANUAL"
  | "ASK_CUISINE_CHOICE"
  | "ASK_CUISINE_MANUAL"
  | "SHOW_PLAN"
  | "WAITING_PAYMENT";

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

// --------------------------------------------------
// MAIN ENTRY
// --------------------------------------------------
export async function handleMealPlanIncoming({
  from,
  userMsg,
}: {
  from: string;
  userMsg: string;
}) {
  const to = (from || "").replace("+", "");
  if (!userMealStates.has(to)) userMealStates.set(to, { step: "START" });

  const state = userMealStates.get(to)!;

  const clean = (userMsg || "").trim();
  const lower = clean.toLowerCase();
  const isPostback = clean.startsWith("__POSTBACK__:");
  const postback = isPostback ? clean.replace("__POSTBACK__:", "") : "";

  // USER ENTRY
  if (
    postback === "ACTION_PLAN_MEAL" ||
    lower.includes("plan meal") ||
    lower.includes("plan a meal")
  ) {
    state.step = "ASK_GOAL";

    await sendSafeMessage(
      buildButtons(to, "Choose your goal:", [
        { id: "GOAL_weight_loss", title: "Weight Loss" },
        { id: "GOAL_muscle_gain", title: "Muscle Gain" },
        { id: "GOAL_maintenance", title: "Maintenance" },
      ])
    );
    return;
  }

  // --------------------------------------------------
  // GOAL
  // --------------------------------------------------
  if (state.step === "ASK_GOAL") {
    if (postback.startsWith("GOAL_")) {
      state.goal = postback.replace("GOAL_", "");
      state.step = "ASK_DIET";

      await sendSafeMessage(
        buildButtons(to, "Choose diet type:", [
          { id: "DIET_veg", title: "Vegetarian" },
          { id: "DIET_nonveg", title: "Non-Veg" },
          { id: "DIET_egg", title: "Eggetarian" },
        ])
      );
    }
    return;
  }

  // --------------------------------------------------
  // DIET
  // --------------------------------------------------
  if (state.step === "ASK_DIET") {
    if (postback.startsWith("DIET_")) {
      state.diet = postback.replace("DIET_", "");
      state.step = "ASK_MEALS";

      await sendSafeMessage(
        buildButtons(to, "Meals per day:", [
          { id: "MEALS_2", title: "2 Meals" },
          { id: "MEALS_3", title: "3 Meals" },
          { id: "MEALS_4", title: "4 Meals" },
        ])
      );
    }
    return;
  }

  // --------------------------------------------------
  // MEALS PER DAY
  // --------------------------------------------------
  if (state.step === "ASK_MEALS") {
    if (postback.startsWith("MEALS_")) {
      state.mealsPerDay = parseInt(postback.replace("MEALS_", ""), 10);
      state.step = "ASK_ALLERGIES";

      await sendSafeMessage(
        buildButtons(to, "Any allergies?", [
          { id: "ALLERGY_none", title: "None" },
          { id: "ALLERGY_common", title: "Common List" },
          { id: "ALLERGY_manual", title: "Type Manually" },
        ])
      );
    }
    return;
  }

  // --------------------------------------------------
  // ALLERGIES
  // --------------------------------------------------
  if (state.step === "ASK_ALLERGIES") {
    if (postback === "ALLERGY_none") {
      state.allergies = "None";
      state.step = "ASK_CUISINE_CHOICE";
    } else if (postback === "ALLERGY_common") {
      state.allergies = "Dairy, gluten, peanuts";
      state.step = "ASK_CUISINE_CHOICE";
    } else if (postback === "ALLERGY_manual") {
      state.step = "ASK_ALLERGIES_MANUAL";
      await sendSafeMessage(buildText(to, "Type your allergies:"));
      return;
    } else {
      state.allergies = clean;
      state.step = "ASK_CUISINE_CHOICE";
    }

    await sendSafeMessage(
      buildButtons(to, "Preferred cuisine:", [
        { id: "CUS_indian", title: "Indian" },
        { id: "CUS_continental", title: "Continental" },
        { id: "CUS_manual", title: "Type Manually" },
      ])
    );
    return;
  }

  if (state.step === "ASK_ALLERGIES_MANUAL") {
    state.allergies = clean;
    state.step = "ASK_CUISINE_CHOICE";

    await sendSafeMessage(
      buildButtons(to, "Preferred cuisine:", [
        { id: "CUS_indian", title: "Indian" },
        { id: "CUS_continental", title: "Continental" },
        { id: "CUS_manual", title: "Type Manually" },
      ])
    );
    return;
  }

  // --------------------------------------------------
  // CUISINE
  // --------------------------------------------------
  if (state.step === "ASK_CUISINE_CHOICE") {
    if (postback.startsWith("CUS_")) {
      if (postback === "CUS_manual") {
        state.step = "ASK_CUISINE_MANUAL";
        await sendSafeMessage(buildText(to, "Type your preferred cuisine:"));
        return;
      } else {
        state.cuisine = postback.replace("CUS_", "");
      }
    } else {
      state.cuisine = clean;
    }

    // proceed to AI
    await generateSendPlan(to, state);
    return;
  }

  if (state.step === "ASK_CUISINE_MANUAL") {
    state.cuisine = clean;

    await generateSendPlan(to, state);
    return;
  }

  // --------------------------------------------------
  // PAYMENT
  // --------------------------------------------------
  if (state.step === "WAITING_PAYMENT") {
    if (lower === "paid") {
      await sendSafeMessage(buildText(to, "Payment verified. Activating your reminders."));
      await activateMealPlanForUser(to);
    }
    return;
  }

  // DEFAULT
  await sendSafeMessage(buildText(to, "Type Plan a meal to start."));
}

// --------------------------------------------------
// Generate meal plan + save in DB
// --------------------------------------------------
async function generateSendPlan(to: string, state: MealState) {
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
    planText,
    priceWeekly: 399,
    priceMonthly: 999,
  });

  await sendSafeMessage(
    buildButtons(
      to,
      `Here is your personalised meal plan:\n\n${planText}\n\nWeekly: ₹399 | Monthly: ₹999\nSubscribe for daily reminders?`,
      [
        { id: "SUB_yes", title: "Subscribe" },
        { id: "SUB_no", title: "Not now" },
      ]
    )
  );
}

// --------------------------------------------------
// AI GENERATION
// --------------------------------------------------
export async function generateMealPlanAI({
  goal,
  diet,
  mealsPerDay,
  allergies,
  cuisine,
}: any) {
  const prompt = `
Create a ${mealsPerDay}-meal plan.
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
Include calories per meal and total.
Practical and concise.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  return (
    res.choices?.[0]?.message?.content?.trim() ||
    "Unable to generate plan."
  );
}

// --------------------------------------------------
// ACTIVATE SUBSCRIPTION
// --------------------------------------------------
export async function activateMealPlanForUser(userId: string) {
  await activateSubscription(userId);
  await saveMealReminder(userId, {
    breakfast: "09:00",
    lunch: "13:00",
    dinner: "20:00",
  });

  await sendSafeMessage(buildText(userId, "Your meal plan subscription is now active."));
  userMealStates.delete(userId);
}
