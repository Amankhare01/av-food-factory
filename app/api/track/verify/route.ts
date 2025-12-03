import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("t");

  if (!orderId || !token) {
    return NextResponse.json(
      { ok: false, error: "Missing parameters" },
      { status: 400 }
    );
  }

  // Customer token must match trackingToken
  const order = await Order.findOne({
    _id: orderId,
    trackingToken: token,     // FIXED HERE
  });

  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired link" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      driverLocation: order.driverLocation || null,
      dropoff: order.dropoff || null,
      deliveryStatus: order.deliveryStatus || "assigned",
    },
  });
}
