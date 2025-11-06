import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, name, phone, mongoOrderId } = await req.json();
    if (!amount || !phone || !mongoOrderId) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `AVF_${mongoOrderId}`,
      notes: { mongoOrderId },
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: "AV Food Factory Order",
      reference_id: mongoOrderId,
      notes: { mongoOrderId, razorpayOrderId: razorpayOrder.id },
      customer: { name, contact: phone },
      notify: { sms: true, email: false },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      paymentLinkUrl: paymentLink.short_url,
    });
  } catch (err: any) {
    console.error("Payment creation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
