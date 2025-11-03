import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `AVF_${mongoOrderId}`,
      notes: { mongoOrderId },
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `AV Food Factory Order`,
      reference_id: razorpayOrder.id,  // ✅ proper mapping
      customer: { name: name || "Customer", contact: phone },
      notify: { sms: true, email: false },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      callback_method: "get",
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
