// lib/mealPlanDB.ts
import connectDB from "./mongodb";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMealPlan extends Document {
  userId: string; // WhatsApp JID (no +)
  goal: string;
  diet: string;
  mealsPerDay: number;
  planText: string;
  priceWeekly: number;
  priceMonthly: number;
  subscribed: boolean;
  subscribedAt?: Date;
}

export interface IMealReminder extends Document {
  userId: string;
  timezone?: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  waterReminders?: boolean;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: String, required: true, index: true },
    goal: String,
    diet: String,
    mealsPerDay: Number,
    planText: String,
    priceWeekly: Number,
    priceMonthly: Number,
    subscribed: { type: Boolean, default: false },
    subscribedAt: Date,
  },
  { timestamps: true }
);

const MealReminderSchema = new Schema<IMealReminder>(
  {
    userId: { type: String, required: true, index: true },
    timezone: String,
    breakfast: String,
    lunch: String,
    dinner: String,
    waterReminders: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev hot-reload
const MealPlan: Model<IMealPlan> =
  (mongoose.models?.MealPlan as Model<IMealPlan>) ?? mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);

const MealReminder: Model<IMealReminder> =
  (mongoose.models?.MealReminder as Model<IMealReminder>) ??
  mongoose.model<IMealReminder>("MealReminder", MealReminderSchema);

export async function saveUserMealPlan(userId: string, payload: {
  goal: string;
  diet: string;
  mealsPerDay: number;
  planText: string;
  priceWeekly?: number;
  priceMonthly?: number;
}) {
  await connectDB();
  const doc = await MealPlan.create({
    userId,
    goal: payload.goal,
    diet: payload.diet,
    mealsPerDay: payload.mealsPerDay,
    planText: payload.planText,
    priceWeekly: payload.priceWeekly ?? 399,
    priceMonthly: payload.priceMonthly ?? 999,
    subscribed: false,
  });
  return doc;
}

export async function activateSubscription(userId: string) {
  await connectDB();
  const plan = await MealPlan.findOneAndUpdate(
    { userId },
    { subscribed: true, subscribedAt: new Date() },
    { new: true, sort: { createdAt: -1 } }
  );
  return plan;
}

export async function saveMealReminder(userId: string, reminder: {
  timezone?: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  waterReminders?: boolean;
}) {
  await connectDB();
  const existing = await MealReminder.findOne({ userId });
  if (existing) {
    existing.timezone = reminder.timezone ?? existing.timezone;
    existing.breakfast = reminder.breakfast ?? existing.breakfast;
    existing.lunch = reminder.lunch ?? existing.lunch;
    existing.dinner = reminder.dinner ?? existing.dinner;
    existing.waterReminders = reminder.waterReminders ?? existing.waterReminders;
    await existing.save();
    return existing;
  }
  const created = await MealReminder.create({ userId, ...reminder });
  return created;
}

export async function getMealPlanForUser(userId: string) {
  await connectDB();
  return MealPlan.findOne({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getReminderForUser(userId: string) {
  await connectDB();
  return MealReminder.findOne({ userId }).lean();
}
