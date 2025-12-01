import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("t");

  if (!orderId || !token)
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );

  const order = await Order.findOne({
  _id: orderId,
  driverTrackingToken: token
});

  if (!order)
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 401 }
    );

  return NextResponse.json({
    ok: true,
    order: {
      dropoff: order.dropoff,
      deliveryStatus: order.deliveryStatus,
    },
  });
}
