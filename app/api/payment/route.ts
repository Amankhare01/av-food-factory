import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { amount, name, phone, mongoOrderId } = await req.json();
    if (!amount || !phone || !mongoOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    // 1️⃣ Create Razorpay Order (for tracking)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `AVF_${mongoOrderId}`,
      notes: { mongoOrderId },
    });

    // 2️⃣ Create Payment Link (this is what user actually pays through)
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `AV Food Factory Order`,
      customer: { name: name || "Customer", contact: phone },
      notify: { sms: true, email: false },
      reference_id: mongoOrderId, // ✅ store your Mongo order id for callback/webhook
      notes: { mongoOrderId, razorpayOrderId: razorpayOrder.id },
      callback_url: `${baseUrl}/payment-success`,
      callback_method: "get",
    });

    // 3️⃣ Save in MongoDB
    await connectDB();
    await Order.findByIdAndUpdate(mongoOrderId, {
      razorpayOrderId: razorpayOrder.id,
      paymentLinkId: paymentLink.id,
      paymentLinkShortUrl: paymentLink.short_url,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      paymentLink,
    });
  } catch (err: any) {
    console.error("❌ Razorpay Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
