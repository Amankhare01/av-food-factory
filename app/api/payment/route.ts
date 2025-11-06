import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { amount, name, phone, mongoOrderId } = await req.json();

    if (!amount || !phone || !mongoOrderId) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // ✅ Initialize Razorpay client
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 1️⃣ Create Razorpay Order (for tracking)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `AVF_${mongoOrderId}`,
      notes: { mongoOrderId },
    });

    // 2️⃣ Create Payment Link (tie to Mongo order)
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `AV Food Factory Order`,
      reference_id: mongoOrderId, // link to your Mongo order
      notes: { mongoOrderId, razorpayOrderId: razorpayOrder.id },
      customer: { name, contact: phone },
      notify: { sms: true, email: false },
      // No callback_url (handled by webhook)
    });

    // 3️⃣ Update Mongo order
    await connectDB();
    await Order.findByIdAndUpdate(mongoOrderId, {
      razorpayOrderId: razorpayOrder.id,
      paymentLinkId: paymentLink.id,
      status: "pending",
    });

    // 4️⃣ Return payment URL for WhatsApp button
    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      paymentLinkUrl: paymentLink.short_url,
    });
  } catch (err: any) {
    console.error("❌ Payment creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
