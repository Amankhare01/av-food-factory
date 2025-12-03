import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  await connectDB();

  const orderId = new URL(req.url).searchParams.get("orderId");

  if (!orderId)
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await Order.findById(orderId);

  if (!order || !order.dropoff)
    return NextResponse.json({ dropoff: null });

  return NextResponse.json({ dropoff: order.dropoff });
}
