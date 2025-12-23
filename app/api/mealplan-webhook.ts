// pages/api/mealplan-webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { activateMealPlanForUser } from "@/lib/mealPlanBot";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const payload = req.body;
    // validate signature if provider provides it (Razorpay/Stripe)
    // Expect a body like: { event: "payment.captured", userId: "919876543210", metadata:{type:"mealplan"} }
    const event = payload?.event || payload?.type || payload?.event_type;
    const userId = payload?.userId || payload?.metadata?.userId || payload?.payload?.userId;
    const meta = payload?.metadata || payload?.meta || {};

    // Quick guard
    if (!event || !userId) {
      return res.status(400).json({ ok: false, error: "missing_event_or_userId" });
    }

    // Adapt this check to your provider's success event name
    const successEvents = ["payment.captured", "payment_success", "payment.succeeded", "payment.success"];
    if (successEvents.includes(event.toString())) {
      // Only activate meal plan if metadata indicates it's for mealplan subscription
      // if your payment flow attaches mongoOrderId or metadata, check it here.
      await activateMealPlanForUser(String(userId).replace("+", ""));
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true, ignored: true });
  } catch (err) {
    console.error("mealplan webhook error:", err);
    return res.status(500).json({ ok: false });
  }
}
