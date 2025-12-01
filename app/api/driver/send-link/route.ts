import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  await connectDB();

  const { orderId, driverId } = await req.json();

  if (!orderId || !driverId) {
    return NextResponse.json(
      { error: "orderId and driverId are required" },
      { status: 400 }
    );
  }

  // 1. Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");

  // 2. Save token + driverId to DB
  await Order.findByIdAndUpdate(orderId, {
    driverId,
    driverTrackingToken: token,
  });

  // 3. Create driver tracking URL
  const driverTrackingUrl = `${process.env.TRACK_BASE_URL}/driver-track?orderId=${orderId}&driverId=${driverId}&t=${token}`;

  return NextResponse.json({
    ok: true,
    driverTrackingUrl,
  });
}
