import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, name, phone, orderId } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // amount in paise
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `AV Food Factory Order - ${orderId}`,
      customer: { name, contact: phone },
      notify: { sms: true, email: false },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify?orderId=${orderId}`,
      callback_method: "get",
    });

    return NextResponse.json({ success: true, paymentLink });
  } catch (err: any) {
    console.error("❌ Razorpay Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
