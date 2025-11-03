import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature")!;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  try {
    Razorpay.validateWebhookSignature(body, signature, secret);
  } catch (err) {
    console.error("❌ Invalid webhook signature:", err);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const payload = JSON.parse(body);
  console.log("✅ Webhook verified for event:", payload.event);

  // ... your order update logic here ...
  return NextResponse.json({ success: true });
}
