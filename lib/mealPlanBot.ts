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
    for (let i = 0; i < text.length; i += 900) {
      const chunk = text.substring(i, i + 900);
      await sendWhatsAppMessage(buildText(payload.to, chunk));
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
  | "ASK_WEIGHT"
  | "ASK_HEIGHT"
  | "ASK_AGE"
  | "ASK_ACTIVITY"
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
  weight?: number;
  height?: number;
  age?: number;
  activity?: string;
  planText?: string;
};

export const userMealStates = new Map<string, MealState>();

// --------------------------------------------------
// MAIN HANDLER
// --------------------------------------------------
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
  if (state.step === "ASK_GOAL" && postback?.startsWith("GOAL_")) {
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

  // ASK_DIET
  if (state.step === "ASK_DIET" && postback?.startsWith("DIET_")) {
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

  // ASK_MEALS
  if (state.step === "ASK_MEALS" && postback?.startsWith("MEALS_")) {
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

  // ASK_ALLERGIES
  if (state.step === "ASK_ALLERGIES") {
    if (postback === "ALLERGIES_none") state.allergies = "None";
    else if (postback === "ALLERGIES_common") state.allergies = "Dairy, Gluten, Peanuts";
    else if (postback === "ALLERGIES_custom") state.allergies = userMsg;
    else state.allergies = userMsg;

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
      if (postback === "CUS_custom") state.cuisine = userMsg;
      else if (postback === "CUS_no_pref") state.cuisine = "No preference";
      else state.cuisine = postback.replace("CUS_", "");
    } else state.cuisine = userMsg;

    state.step = "ASK_WEIGHT";
    await sendSafeMessage(buildText(to, "Enter your weight in kg (e.g., 70):"));
    return;
  }

  // ASK_WEIGHT
  if (state.step === "ASK_WEIGHT") {
    const w = parseFloat(userMsg);
    if (!isNaN(w)) state.weight = w;
    state.step = "ASK_HEIGHT";
    await sendSafeMessage(buildText(to, "Enter your height in cm (e.g., 175):"));
    return;
  }

  // ASK_HEIGHT
  if (state.step === "ASK_HEIGHT") {
    const h = parseFloat(userMsg);
    if (!isNaN(h)) state.height = h;
    state.step = "ASK_AGE";
    await sendSafeMessage(buildText(to, "Enter your age in years:"));
    return;
  }

  // ASK_AGE
  if (state.step === "ASK_AGE") {
    const a = parseInt(userMsg, 10);
    if (!isNaN(a)) state.age = a;
    state.step = "ASK_ACTIVITY";

    await sendSafeMessage(
      buildButtons(to, "Select activity level:", [
        { id: "ACT_low", title: "Low" },
        { id: "ACT_moderate", title: "Moderate" },
        { id: "ACT_high", title: "High" },
      ])
    );
    return;
  }

  // ASK_ACTIVITY
  if (state.step === "ASK_ACTIVITY") {
    if (postback?.startsWith("ACT_")) state.activity = postback.replace("ACT_", "");

    // GENERATE PLAN
    const planText = await generateMealPlanAI({
      goal: state.goal!,
      diet: state.diet!,
      mealsPerDay: state.mealsPerDay!,
      allergies: state.allergies!,
      cuisine: state.cuisine!,
      weight: state.weight!,
      height: state.height!,
      age: state.age!,
      activity: state.activity!,
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

    // Send full plan in safe text
    await sendSafeMessage(buildText(to, `Here is your personalised meal plan:\n\n${planText}`));

    // Send buttons separately (<1024 chars)
    await sendSafeMessage(
      buildButtons(to, "Weekly: ₹399 | Monthly: ₹999\nSubscribe for daily reminders?", [
        { id: "SUB_subscribe", title: "Subscribe" },
        { id: "SUB_later", title: "Not now" },
      ])
    );
    return;
  }

  // SHOW_PLAN
  if (state.step === "SHOW_PLAN") {
    if (postback === "SUB_subscribe") {
      state.step = "WAITING_PAYMENT";
      await sendSafeMessage(buildText(to, "Great! Click the pay link and reply 'PAID' to activate reminders."));
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

// --------------------------------------------------
// AI MEAL PLAN GENERATOR
// --------------------------------------------------
export async function generateMealPlanAI(data: any) {
  const prompt = `
You are a professional nutritionist.
Create a ${data.mealsPerDay}-meal plan for:
Goal: ${data.goal}
Diet: ${data.diet}
Weight: ${data.weight}kg
Height: ${data.height}cm
Age: ${data.age} years
Activity level: ${data.activity}
Allergies: ${data.allergies}
Cuisine: ${data.cuisine}

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

  return res.choices?.[0]?.message?.content?.trim() ?? "Unable to generate plan.";
}

// --------------------------------------------------
// ACTIVATE SUBSCRIPTION
// --------------------------------------------------
export async function activateMealPlanForUser(userId: string) {
  await activateSubscription(userId);
  await saveMealReminder(userId, { breakfast: "09:00", lunch: "13:00", dinner: "20:00" });
  await sendSafeMessage(buildText(userId, "Your meal plan subscription is now active!"));
  userMealStates.delete(userId);
}
