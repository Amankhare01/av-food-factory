import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const razorpayPaymentId = url.searchParams.get("razorpay_payment_id");
  const razorpaySignature = url.searchParams.get("razorpay_signature");

  if (!orderId || !razorpayPaymentId || !razorpaySignature)
    return NextResponse.json({ success: false, error: "Invalid callback" }, { status: 400 });

  // verify signature (optional if you want extra security)
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = orderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature !== razorpaySignature)
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });

  // Update order as paid
  await connectDB();
  await Order.findOneAndUpdate({ _id: orderId }, { paid: true });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`);
}
