// app/api/payment/confirm/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  try {
    const { referenceId, paymentId } = await req.json();
    if (!referenceId || !paymentId) {
      return NextResponse.json({ success: false, error: "Missing referenceId or paymentId" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(referenceId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Already paid? skip duplicate notifications
    if (order.paid) {
      return NextResponse.json({ success: true, message: "Already marked paid" });
    }

    // ✅ Update DB
    order.paid = true;
    order.status = "paid";
    order.paymentId = paymentId;
    await order.save();

    // ✅ WhatsApp Notifications
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: order.phone!,
      type: "text",
      text: {
        body: `✅ *Payment Received!* \nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️\nPayment ID: ${paymentId}`,
      },
    });

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN_PHONE,
      type: "text",
      text: {
        body: `📦 *Paid Order Confirmed*\nCustomer: ${order.phone}\nItem: ${order.itemName}\nQty: ${order.qty}\nAmount: ₹${order.total}\nPayment ID: ${paymentId}`,
      },
    });

    return NextResponse.json({ success: true, message: "Payment confirmed and WhatsApp sent" });
  } catch (err: any) {
    console.error("❌ /payment/confirm error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
