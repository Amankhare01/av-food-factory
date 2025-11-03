import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, name, phone, mongoOrderId ,order_id} = await req.json();

    if (!amount || !phone || !mongoOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // ✅ Step 1: Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `AVF_${mongoOrderId}`,
      notes: { mongoOrderId },
    });

    if (!razorpayOrder?.id) {
      throw new Error("Failed to create Razorpay order");
    }

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    // ✅ Step 2: Create Payment Link (⚠️ use await)
   const paymentLink = await razorpay.paymentLink.create({
  amount: amount * 100,
  currency: "INR",
  description: `AV Food Factory Order`,
 
  ...( { order_id: razorpayOrder.id } as any ),
  customer: {
    name: name || "Customer",
    contact: phone,
  },
  notify: { sms: true, email: false },
  callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
  callback_method: "get",
});


    console.log("✅ Payment link created:", paymentLink);

    // ✅ Step 3: Return data to bot
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
