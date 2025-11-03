import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== signature) {
    console.error("❌ Invalid Razorpay webhook signature");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const payload = JSON.parse(body);
  const payment = payload.payload.payment.entity;
  const paymentId = payment.id;
  const razorOrderId = payment.order_id;

  await connectDB();
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId: razorOrderId },
    { paid: true, paymentId },
    { new: true }
  );

  if (order) {
    console.log("✅ Payment matched to order:", order._id);

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
        body: `📦 *Paid Order Confirmed*\nCustomer: ${order.phone}\nItem: ${order.itemName}\nAmount: ₹${order.total}\nPayment ID: ${paymentId}`,
      },
    });
  } else {
    console.warn("⚠️ No order found for razorpayOrderId:", razorOrderId);
  }

  return NextResponse.json({ success: true });
}
