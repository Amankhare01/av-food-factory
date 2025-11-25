// lib/mealPlanBot.ts
import { sendWhatsAppMessage } from "./botLogic"; // reuse existing sender
import { buildText, buildButtons } from "./mealPlanUIBuilders";
import OpenAI from "openai";
import { saveUserMealPlan, saveMealReminder, activateSubscription } from "./mealPlanDB";

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- User state ----
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

// ---- MAIN HANDLER ----
export async function handleMealPlanIncoming({ from, userMsg }: { from: string; userMsg: string }) {
  const to = (from || "").replace("+", "");
  if (!userMealStates.has(to)) userMealStates.set(to, { step: "START" });
  const state = userMealStates.get(to)!;
  const lower = (userMsg || "").trim().toLowerCase();
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // Entry via button or text
  if (postback === "ACTION_PLAN_MEAL" || lower.includes("plan a meal") || lower.includes("plan meal")) {
    state.step = "ASK_GOAL";
    await sendWhatsAppMessage(
      buildButtons(to, "Let's personalise your meal plan. Choose your goal:", [
        { id: "GOAL_weight_loss", title: "Weight Loss" },
        { id: "GOAL_muscle_gain", title: "Muscle Gain" },
        { id: "GOAL_maintenance", title: "Maintenance" },
      ])
    );
    return;
  }

  // ---- ASK_GOAL ----
  if (state.step === "ASK_GOAL") {
    if (postback?.startsWith("GOAL_") || lower.includes("weight") || lower.includes("muscle") || lower.includes("maintain")) {
      state.goal = postback?.replace("GOAL_", "") || (lower.includes("weight") ? "weight_loss" : lower.includes("muscle") ? "muscle_gain" : "maintenance");
      state.step = "ASK_DIET";
      await sendWhatsAppMessage(
        buildButtons(to, "Choose diet type:", [
          { id: "DIET_veg", title: "Vegetarian" },
          { id: "DIET_nonveg", title: "Non-Veg" },
          { id: "DIET_eggetarian", title: "Eggetarian" },
        ])
      );
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Please choose a goal from the buttons."));
    return;
  }

  // ---- ASK_DIET ----
  if (state.step === "ASK_DIET") {
    if (postback?.startsWith("DIET_") || lower.includes("veg") || lower.includes("non") || lower.includes("egg")) {
      state.diet = postback?.replace("DIET_", "") || (lower.includes("non") ? "non-veg" : lower.includes("egg") ? "eggetarian" : "veg");
      state.step = "ASK_MEALS";
      await sendWhatsAppMessage(
        buildButtons(to, "Meals per day:", [
          { id: "MEALS_2", title: "2" },
          { id: "MEALS_3", title: "3" },
          { id: "MEALS_4", title: "4" },
        ])
      );
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Please choose diet type from the buttons."));
    return;
  }

  // ---- ASK_MEALS ----
  if (state.step === "ASK_MEALS") {
    if (postback?.startsWith("MEALS_") || ["2", "3", "4"].includes(lower)) {
      state.mealsPerDay = parseInt(postback?.replace("MEALS_", "") || lower, 10);
      state.step = "ASK_ALLERGIES";
      await sendWhatsAppMessage(
        buildText(to, "Do you have any allergies or food restrictions? (Type 'none' if no restrictions)")
      );
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Choose 2, 3 or 4 from the buttons."));
    return;
  }

  // ---- ASK_ALLERGIES ----
  if (state.step === "ASK_ALLERGIES") {
    state.allergies = userMsg.trim();
    state.step = "ASK_CUISINE";
    await sendWhatsAppMessage(
      buildText(to, "Do you have preferred cuisines or foods you dislike? (Type 'no preference' if none)")
    );
    return;
  }

  // ---- ASK_CUISINE ----
  if (state.step === "ASK_CUISINE") {
    state.cuisine = userMsg.trim();

    // Generate plan using OpenAI
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

    await sendWhatsAppMessage(
      buildButtons(
        to,
        `Your plan (brief):\n\n${planText}\n\nWeekly: ₹399 • Monthly: ₹999\n\nSubscribe to activate reminders?`,
        [
          { id: "SUB_subscribe", title: "Subscribe" },
          { id: "SUB_later", title: "Not now" },
        ]
      )
    );
    return;
  }

  // ---- SUBSCRIBE / SHOW_PLAN ----
  if (state.step === "SHOW_PLAN") {
    if (postback === "SUB_subscribe" || lower.includes("subscribe")) {
      state.step = "WAITING_PAYMENT";
      await sendWhatsAppMessage(buildText(to, "Great — create payment using the pay link. After successful payment the plan will be activated."));
      return;
    }
    if (postback === "SUB_later" || lower.includes("not now")) {
      userMealStates.delete(to);
      await sendWhatsAppMessage(buildText(to, "No problem. Type 'plan a meal' when you want to create one."));
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Please choose Subscribe or Not now."));
    return;
  }

  // ---- WAITING_PAYMENT ----
  if (state.step === "WAITING_PAYMENT") {
    await sendWhatsAppMessage(buildText(to, "If you have paid, reply 'paid' and we will check."));
    if (lower === "paid") {
      await sendWhatsAppMessage(buildText(to, "Thanks. We will verify and enable reminders if payment is confirmed."));
    }
    return;
  }

  // ---- Default fallback ----
  await sendWhatsAppMessage(buildText(to, "Type 'plan a meal' to start a personalised plan or tap the Plan a Meal button."));
}

// ---- OpenAI meal plan generator ----
export async function generateMealPlanAI({
  goal,
  diet,
  mealsPerDay,
  allergies,
  cuisine,
}: {
  goal: string;
  diet: string;
  mealsPerDay: number;
  allergies: string;
  cuisine: string;
}) {
  const prompt = `
You are a professional nutritionist.
Create a ${mealsPerDay}-meal per day plan for someone with goal: ${goal}, diet: ${diet}.
Allergies/restrictions: ${allergies}.
Preferred/disliked cuisines: ${cuisine}.
Format as:
Breakfast: ...
Snack: ...
Lunch: ...
Snack: ...
Dinner: ...
Provide approximate calories per meal and total daily calories.
Keep it concise and practical.
  `;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content?.trim() || "Unable to generate plan.";
}

// ---- Activate subscription after payment ----
export async function activateMealPlanForUser(userId: string) {
  await activateSubscription(userId);
  await saveMealReminder(userId, { breakfast: "09:00", lunch: "13:00", dinner: "20:00" });
  await sendWhatsAppMessage(buildText(userId, "Your meal plan subscription is active. We will start sending reminders."));
  userMealStates.delete(userId);
}
