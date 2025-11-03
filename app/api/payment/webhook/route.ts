import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: NextRequest) {
  try {
    // 1️ Get the raw body (never JSON-parsed)
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("❌ Missing RAZORPAY_WEBHOOK_SECRET in environment");
      return NextResponse.json({ success: false, error: "Missing secret" }, { status: 500 });
    }

    if (!signature) {
      console.error("❌ Missing x-razorpay-signature header");
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    // 2️ Validate signature using Razorpay SDK (safest method)
    try {
      Razorpay.validateWebhookSignature(body, signature, secret);
    } catch (err) {
      console.error("❌ Invalid Razorpay webhook signature");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // 3️ Parse verified body
    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment?.entity;

    if (!payment) {
      console.error("⚠️ No payment entity found in webhook payload");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const paymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount / 100;

    console.log(`✅ Verified webhook for event: ${event}, paymentId: ${paymentId}`);

    // 4️⃣ Connect DB & update order
    await connectDB();
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId },
      { paid: true, paymentId },
      { new: true }
    );

    if (order) {
      console.log("✅ Payment matched to order:", order._id);

      // 5️⃣ Notify customer via WhatsApp
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: order.phone!,
        type: "text",
        text: {
          body: `✅ *Payment Received!* \nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️`,
        },
      });

      // 6️⃣ Notify admin
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: {
          body:
            `📦 *Paid Order Confirmed*\n` +
            `Customer: ${order.phone}\n` +
            `Item: ${order.itemName}\n` +
            `Qty: ${order.qty}\n` +
            `Amount: ₹${order.total}\n` +
            `Payment ID: ${paymentId}\n` +
            `Time: ${new Date().toLocaleString("en-IN")}`,
        },
      });
    } else {
      console.warn("⚠️ No matching order found for Razorpay Order ID:", razorpayOrderId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
