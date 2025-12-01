import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import crypto from "crypto";

export async function POST(req: Request) {
  await connectDB();
  const { orderId } = await req.json();

  if (!orderId)
    return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await Order.findById(orderId);
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Generate Random token
  const token = crypto.randomBytes(32).toString("hex");

  order.trackingToken = token;
  await order.save();

  const trackingUrl = `${process.env.TRACK_BASE_URL}/track/${orderId}?t=${token}`;

  return NextResponse.json({ trackingUrl });
}
