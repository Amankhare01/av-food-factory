import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const sig = req.headers.get("x-razorpay-signature");
    const raw = await req.text();
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sig) return NextResponse.json({ success: false }, { status: 400 });

    const body = JSON.parse(raw);
    const entity = body.payload?.payment?.entity || body.payload?.payment_link?.entity;
    if (!entity) return NextResponse.json({ success: false }, { status: 400 });

    await connectDB();
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    const order = await Order.findByIdAndUpdate(
      mongoOrderId,
      { paid: true, status: "paid", paymentId: entity.id },
      { new: true }
    );

    if (order) {
      const receipt = `🧾 *AV Food Factory Receipt*\n\n🍽️ Item: ${order.itemName}\n🔢 Qty: ${order.qty}\n💰 Total: ₹${order.total}\n💳 Payment ID: ${entity.id}\n📦 Status: Confirmed\n🕒 ${new Date().toLocaleString("en-IN")}\n\nThank you for ordering!`;

      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: order.phone!,
        type: "text",
        text: { body: receipt },
      });

      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: {
          body: `📦 *Paid Order Confirmed*\nCustomer: ${order.phone}\nItem: ${order.itemName}\nQty: ${order.qty}\nTotal: ₹${order.total}\nPayment ID: ${entity.id}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
