// app/api/payment/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic"; // ✅ import bot sender

export const runtime = "nodejs";
const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const sig = req.headers.get("x-razorpay-signature");
  const raw = await req.text();

  // ✅ Verify signature
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (expected !== sig) {
    console.error("❌ Razorpay signature mismatch");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const body = JSON.parse(raw);
    const entity =
      body.payload?.payment_link?.entity ||
      body.payload?.payment?.entity ||
      null;

    if (!entity) {
      console.error("❌ Missing payment entity");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    const paymentId = entity.id;
    const razorpayOrderId = entity.order_id || entity.id;

    console.log("✅ Payment confirmed:", mongoOrderId, paymentId);

    await connectDB();
    const updated = await Order.findByIdAndUpdate(
      mongoOrderId,
      { paid: true, paymentId, razorpayOrderId, status: "paid" },
      { new: true }
    );

    if (!updated) {
      console.error("❌ Order not found for", mongoOrderId);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // 🧾 Build receipt text
    const receipt = `🧾 *AV Food Factory Receipt*\n\n🍽️ Item: ${updated.itemName}\n🔢 Qty: ${updated.qty}\n💰 Total: ₹${updated.total}\n💳 Payment ID: ${updated.paymentId}\n📦 Status: Confirmed\n🕒 ${new Date().toLocaleString("en-IN")}\n\nThank you for ordering!`;

    try {
      // ✅ Send to customer
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: updated.phone,
        type: "text",
        text: { body: receipt },
      });

      // ✅ Send to admin
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: {
          body: `📦 *Paid Order Confirmed*\n👤 Customer: ${updated.phone}\n🍽️ Item: ${updated.itemName}\n🔢 Qty: ${updated.qty}\n💰 Total: ₹${updated.total}\n💳 Payment ID: ${updated.paymentId}\n🕒 ${new Date().toLocaleString("en-IN")}`,
        },
      });

      console.log("✅ WhatsApp receipts sent to admin & customer");
    } catch (waErr) {
      console.error("❌ WhatsApp send error:", waErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
