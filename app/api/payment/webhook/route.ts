import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { handlePaymentUpdate } from "@/lib/botLogic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

export async function POST(req: Request) {
  console.log(" Razorpay Webhook Triggered");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error(" Signature mismatch");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    console.log(" Verified Event:", body.event);

    const entity =
      body.payload?.payment?.entity ||
      body.payload?.payment_link?.entity ||
      body.payload?.order?.entity;

    if (!entity) {
      console.error("❌ Missing entity");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;

    if (!mongoOrderId) {
      console.error(" mongoOrderId missing");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log(" mongoOrderId:", mongoOrderId);


    await handlePaymentUpdate(mongoOrderId, entity.id);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
