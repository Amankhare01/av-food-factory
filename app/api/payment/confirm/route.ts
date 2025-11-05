import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  try {
    const { referenceId, paymentId } = await req.json();
    if (!referenceId || !paymentId) {
      console.error("Missing referenceId/paymentId:", referenceId, paymentId);
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(referenceId);
    if (!order) {
      console.error("Order not found:", referenceId);
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (order.paid) {
      console.log("Already marked paid:", referenceId);
      return NextResponse.json({ success: true });
    }

    order.paid = true;
    order.status = "paid";
    order.paymentId = paymentId;
    await order.save();

    const msgUser = `✅ *Payment Received!*
Your order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️
Payment ID: ${paymentId}`;

    const msgAdmin = `📦 *Paid Order Confirmed*
Customer: ${order.phone}
Item: ${order.itemName}
Qty: ${order.qty}
Amount: ₹${order.total}
Payment ID: ${paymentId}`;

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: order.phone!,
      type: "text",
      text: { body: msgUser },
    });

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN_PHONE,
      type: "text",
      text: { body: msgAdmin },
    });

    console.log("✅ Payment confirmed + WhatsApp sent");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Confirm route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
