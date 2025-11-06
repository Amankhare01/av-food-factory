import { NextResponse } from "next/server";
import crypto from "crypto";
import { handlePaymentUpdate } from "@/lib/botLogic"; // ✅ call bot directly

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("📬 Razorpay Webhook Hit (via /api/payment/webhook)");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const sig = req.headers.get("x-razorpay-signature");
    const raw = await req.text();

    console.log("🔐 Received Signature:", sig);
    console.log("🧾 Raw Length:", raw.length);

    // ✅ Step 1: Verify signature
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sig) {
      console.error("❌ Signature mismatch — webhook rejected");
      return NextResponse.json({ ok: false, reason: "bad-signature" }, { status: 400 });
    }

    // ✅ Step 2: Parse body
    const body = JSON.parse(raw);
    const entity =
      body.payload?.payment_link?.entity ||
      body.payload?.payment?.entity ||
      null;

    if (!entity) {
      console.error("❌ Missing payment entity in webhook");
      console.log("Full payload:", JSON.stringify(body, null, 2).slice(0, 1000));
      return NextResponse.json({ ok: false, reason: "no-entity" }, { status: 400 });
    }

    console.log("✅ Event:", body.event);
    console.log("🧩 Entity:", {
      id: entity.id,
      status: entity.status,
      reference_id: entity.reference_id,
      notes: entity.notes,
    });

    // ✅ Step 3: Extract identifiers
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    const paymentId = entity.id;

    if (!mongoOrderId) {
      console.error("❌ No mongoOrderId found in webhook payload");
      return NextResponse.json({ ok: false, reason: "no-order-id" }, { status: 400 });
    }

    // ✅ Step 4: Call bot handler directly
    await handlePaymentUpdate(mongoOrderId, paymentId);
    console.log("✅ Payment update handled by bot");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
