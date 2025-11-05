import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

export const runtime = "nodejs"; // ensure raw body access

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  console.log("📬 Razorpay Webhook Hit");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const sig = req.headers.get("x-razorpay-signature");
    const raw = await req.text();
    console.log("🔐 Signature:", sig);
    console.log("📝 Raw Body:", raw);

    // ✅ Verify signature
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sig) {
      console.error("❌ Signature mismatch");
      return NextResponse.json({ success: false, reason: "bad-signature" }, { status: 400 });
    }

    const body = JSON.parse(raw);
    console.log("✅ Verified Webhook Event:", body.event);

    const entity =
      body.payload?.payment?.entity || body.payload?.payment_link?.entity;
    if (!entity) {
      console.error("❌ Missing payment entity");
      return NextResponse.json({ success: false, reason: "no-entity" }, { status: 400 });
    }

    await connectDB();

    // The mongoOrderId is passed when creating the payment link
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    console.log("🆔 Mongo Order ID:", mongoOrderId);

    // ✅ Update the order in MongoDB
    const updated = await Order.findByIdAndUpdate(
      mongoOrderId,
      {
        paid: true,
        razorpayOrderId: entity.order_id,
        paymentId: entity.id,
      },
      { new: true }
    );

    console.log("💾 DB Update Result:", updated ? "Updated" : "Not found");

    // ✅ Send WhatsApp receipts once DB is updated
    if (updated) {
      const receipt = `🧾 *AV Food Factory Receipt*\n\n🍽️ Item: ${updated.itemName}\n🔢 Qty: ${updated.qty}\n💰 Total: ₹${updated.total}\n💳 Payment ID: ${updated.paymentId}\n📦 Status: Confirmed\n🕒 ${new Date().toLocaleString("en-IN")}\n\nThank you for ordering!`;

      // Customer
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: updated.phone!,
        type: "text",
        text: { body: receipt },
      });

      // Admin
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: {
          body: `📦 *Paid Order Confirmed*\nCustomer: ${updated.phone}\nItem: ${updated.itemName}\nQty: ${updated.qty}\nTotal: ₹${updated.total}\nPayment ID: ${updated.paymentId}\nTime: ${new Date().toLocaleString("en-IN")}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
