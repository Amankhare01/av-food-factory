import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

export const runtime = "nodejs";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  console.log("📬 Razorpay Webhook Hit");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const sig = req.headers.get("x-razorpay-signature");
    const raw = await req.text();

    // ✅ Signature verification
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sig) {
      console.error("❌ Signature mismatch");
      return NextResponse.json({ success: false, reason: "bad-signature" }, { status: 400 });
    }

    const body = JSON.parse(raw);
    console.log("✅ Verified event:", body.event);

    // ✅ Handle both event types
    const entity =
      body.payload?.payment_link?.entity ||
      body.payload?.payment?.entity ||
      null;

    if (!entity) {
      console.error("❌ No payment entity in webhook body");
      return NextResponse.json({ success: false, reason: "no-entity" }, { status: 400 });
    }

    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    console.log("🆔 Mongo Order ID:", mongoOrderId);

    if (!mongoOrderId) {
      console.error("❌ No mongoOrderId in notes/reference");
      return NextResponse.json({ success: false, reason: "no-order-id" }, { status: 400 });
    }

    await connectDB();

    // ✅ Update order as paid
    const updated = await Order.findByIdAndUpdate(
      mongoOrderId,
      {
        paid: true,
        status: "paid",
        razorpayOrderId: entity.order_id || entity.id,
        paymentId: entity.id,
      },
      { new: true }
    );

    if (!updated) {
      console.error("❌ No matching order found in DB");
      return NextResponse.json({ success: false, reason: "order-not-found" }, { status: 404 });
    }

    console.log("💾 Order updated as paid:", updated._id);

    // ✅ Send WhatsApp Receipt to Customer
    const receipt = `🧾 *AV Food Factory Receipt*\n\n🍽️ Item: ${updated.itemName}\n🔢 Qty: ${updated.qty}\n💰 Total: ₹${updated.total}\n💳 Payment ID: ${updated.paymentId}\n📦 Status: Confirmed\n🕒 ${new Date().toLocaleString("en-IN")}\n\nThank you for ordering with us!`;

    try {
      // Customer
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: updated.phone,
        type: "text",
        text: { body: receipt },
      });

      // Admin
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: {
          body: `📦 *Paid Order Confirmed*\n👤 Customer: ${updated.phone}\n🍽️ Item: ${updated.itemName}\n🔢 Qty: ${updated.qty}\n💰 Total: ₹${updated.total}\n💳 Payment ID: ${updated.paymentId}\n🕒 ${new Date().toLocaleString("en-IN")}`,
        },
      });

      console.log("✅ WhatsApp receipts sent successfully");
    } catch (waErr) {
      console.error("❌ WhatsApp send error:", waErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
