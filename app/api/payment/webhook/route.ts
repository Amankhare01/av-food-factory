import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Read the raw request body (required for signature verification)
    const rawBody = await req.text();
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

    // 2️⃣ Validate webhook signature using Razorpay SDK (the safest way)
    try {
      Razorpay.validateWebhookSignature(rawBody, signature, secret);
      console.log("✅ Razorpay signature verified successfully");
    } catch (err) {
      console.error("❌ Invalid Razorpay webhook signature");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // 3️⃣ Parse the verified body
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      console.error("⚠️ No payment entity found in webhook payload");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const paymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount / 100;
    const status = payment.status;

    console.log(`✅ Verified webhook for event: ${event}, paymentId: ${paymentId}, status: ${status}`);

    // 4️⃣ Connect to MongoDB
    await connectDB();

    // 5️⃣ Handle successful payment
    if (event === "payment.captured" || status === "captured") {
      const order = await Order.findOneAndUpdate(
        {razorpayOrderId },
        { paid: true, paymentId },
        { new: true }
      );

      if (order) {
        console.log("✅ Payment matched to order:", order._id);

        // Send WhatsApp confirmation to customer
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `✅ *Payment Received!* \nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️\n\nThank you for ordering with AV Food Factory.`,
          },
        });

        // Notify admin
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
    }

    // 6️⃣ Handle payment failures (optional but good practice)
    if (event === "payment.failed" || status === "failed") {
      const { error_description } = payment;
      console.warn("⚠️ Payment failed:", error_description);

      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        // Notify user
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `❌ *Payment Failed*\nWe couldn’t process your payment for *${order.itemName}* (₹${order.total}).\nReason: ${error_description || "Unknown"}.\n\nPlease try again or contact support.`,
          },
        });

        // Notify admin
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: ADMIN_PHONE,
          type: "text",
          text: {
            body:
              `⚠️ *Payment Failed Alert*\n` +
              `Customer: ${order.phone}\n` +
              `Item: ${order.itemName}\n` +
              `Amount: ₹${order.total}\n` +
              `Error: ${error_description || "Unknown"}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
