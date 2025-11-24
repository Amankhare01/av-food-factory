// lib/mealPlanBot.ts
import { sendWhatsAppMessage } from "./botLogic"; // re-use existing sender
import { buildText, buildButtons} from "./mealPlanUIBuilders";
import { generateMealPlanAI } from "./mealPlanAI";
import { saveUserMealPlan, saveMealReminder, activateSubscription } from "./mealPlanDB";

/**
 * Note:
 * - We use a small in-memory state per user here. For production switch to Redis if you want persistence across restarts.
 */
type MealStep =
  | "START"
  | "ASK_GOAL"
  | "ASK_DIET"
  | "ASK_MEALS"
  | "SHOW_PLAN"
  | "WAITING_PAYMENT"
  | "ACTIVE";

type MealState = {
  step: MealStep;
  goal?: string;
  diet?: string;
  mealsPerDay?: number;
  planText?: string;
};

const userMealStates = new Map<string, MealState>();

export async function handleMealPlanIncoming({ from, userMsg }: { from: string; userMsg: string }) {
  const to = (from || "").replace("+", "");
  if (!userMealStates.has(to)) userMealStates.set(to, { step: "START" });
  const state = userMealStates.get(to)!;
  const lower = (userMsg || "").trim().toLowerCase();
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // Entry via the button or text
  if (postback === "ACTION_PLAN_MEAL" || lower === "plan a meal" || lower === "plan meal") {
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

  // ASK_GOAL
  if (state.step === "ASK_GOAL") {
    if (postback?.startsWith("GOAL_") || lower.includes("weight") || lower.includes("muscle") || lower.includes("maintain")) {
      const val = (postback?.replace("GOAL_", "") || (lower.includes("weight") ? "weight_loss" : lower.includes("muscle") ? "muscle_gain" : "maintenance")).replace(/_/g, " ");
      state.goal = val;
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

  // ASK_DIET
  if (state.step === "ASK_DIET") {
    if (postback?.startsWith("DIET_") || lower.includes("veg") || lower.includes("non") || lower.includes("egg")) {
      const val = postback?.replace("DIET_", "") || (lower.includes("non") ? "non-veg" : lower.includes("egg") ? "eggetarian" : "veg");
      state.diet = val;
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

  // ASK_MEALS
  if (state.step === "ASK_MEALS") {
    if (postback?.startsWith("MEALS_") || ["2","3","4"].includes(lower)) {
      const meals = postback?.replace("MEALS_", "") || lower;
      const n = parseInt(meals, 10) || 3;
      state.mealsPerDay = n;
      // generate plan
      const planText = await generateMealPlanAI(state.goal!, state.diet!, state.mealsPerDay);
      state.planText = planText;
      state.step = "SHOW_PLAN";

      // Save draft plan in DB (not subscribed)
      await saveUserMealPlan(to, {
        goal: state.goal!,
        diet: state.diet!,
        mealsPerDay: state.mealsPerDay,
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
    await sendWhatsAppMessage(buildText(to, "Choose 2, 3 or 4 from the buttons."));
    return;
  }

  // SUBSCRIBE
  if (state.step === "SHOW_PLAN") {
    if (postback === "SUB_subscribe" || lower.includes("subscribe")) {
      // Here you should generate a payment link (Razorpay etc) using your /api/payment route.
      // For now, instruct user and mark waiting for payment.
      state.step = "WAITING_PAYMENT";
      await sendWhatsAppMessage(buildText(to, "Great — create payment using the pay link. After successful payment the plan will be activated."));
      // Ideally return a generated payment link via your existing /api/payment using saved plan record.
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

  // WAITING_PAYMENT — we wait for webhook to call activate meal reminders
  if (state.step === "WAITING_PAYMENT") {
    await sendWhatsAppMessage(buildText(to, "If you have paid, reply 'paid' and we will check."));
    if (lower === "paid") {
      // If you want, you can try to lookup payment via DB and validate — minimal example:
      await sendWhatsAppMessage(buildText(to, "Thanks. We will verify and enable reminders if payment is confirmed."));
    }
    return;
  }

  // default fallback
  await sendWhatsAppMessage(buildText(to, "Type 'plan a meal' to start a personalised plan or tap the Plan a Meal button."));
}

// Called by payment webhook after verifying payment for the user
export async function activateMealPlanForUser(userId: string) {
  // mark subscription active
  const plan = await activateSubscription(userId);
  // default reminders (can be prompted to user later)
  await saveMealReminder(userId, { breakfast: "09:00", lunch: "13:00", dinner: "20:00" });
  // send confirmation
  await sendWhatsAppMessage(buildText(userId, "Your meal plan subscription is active. We will start sending reminders."));
  // clear in-memory state
  userMealStates.delete(userId);
}

