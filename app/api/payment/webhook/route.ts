import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

export const runtime = "nodejs"; // ✅ ensures raw body stream

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    if (!signature) {
      console.error("❌ Missing x-razorpay-signature header");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // ✅ Verify Signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Invalid Razorpay webhook signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log("✅ Webhook signature verified successfully");

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ success: false }, { status: 400 });

    const { id: paymentId, order_id: razorpayOrderId, amount, status } = payment;
    console.log(`📩 Webhook Event: ${event}, Payment: ${paymentId}, Status: ${status}`);

    await connectDB();

    if (event === "payment.captured" || status === "captured") {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paid: true, paymentId },
        { new: true }
      );

      if (order) {
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `✅ *Payment Received!* \nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️`,
          },
        });

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
              `Payment ID: ${paymentId}`,
          },
        });
      }
    } else if (event === "payment.failed" || status === "failed") {
      const { error_description } = payment;
      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `❌ *Payment Failed*\nWe couldn’t process your payment for *${order.itemName}* (₹${order.total}).\nReason: ${error_description || "Unknown"}.`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
