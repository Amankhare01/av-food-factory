import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { handlePaymentUpdate } from "@/lib/botLogic";  // IMPORTANT FIX

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

export async function POST(req: Request) {
  console.log("🚀 Razorpay Webhook Triggered");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // 1) Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("⛔ Invalid Razorpay signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    console.log("✔ Verified Razorpay Event:", body.event);

    // 2) Get payment entity
    const entity =
      body.payload?.payment?.entity ||
      body.payload?.payment_link?.entity ||
      body.payload?.order?.entity;

    if (!entity) {
      console.error("⛔ Missing entity in webhook payload");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 3) Extract mongoOrderId
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    console.log("🟦 mongoOrderId:", mongoOrderId);

    if (!mongoOrderId) {
      console.error("⛔ mongoOrderId missing from Razorpay");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 4) DB connect
    await connectDB();

    // (Optional) Small update
    await Order.findByIdAndUpdate(mongoOrderId, {
      paid: true,
      status: "paid",
      paymentId: entity.id,
      razorpayOrderId: entity.order_id,
    });

    console.log("✔ Order updated in DB");

    // 5) CALL handlePaymentUpdate() — FULL FLOW (driver + tracking + receipt)
    console.log("🚀 Calling handlePaymentUpdate...");
    await handlePaymentUpdate(mongoOrderId, entity.id);
    console.log("✔ handlePaymentUpdate Completed");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
