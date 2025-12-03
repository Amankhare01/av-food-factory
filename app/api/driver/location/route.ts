// app/api/driver/location/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { io } from "@/lib/socket";

export async function POST(req: Request) {
  await connectDB();

  // AUTH CHECK
  const key = req.headers.get("x-driver-key");
  if (key !== process.env.DRIVER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, orderId, lat, lng } = await req.json();

  if (!orderId || !driverId || !lat || !lng) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // 1️⃣ Update driver's live location in order DB
  const updated = await Order.findByIdAndUpdate(
    orderId,
    {
      driverId,
      driverLocation: { lat, lng },
      deliveryStatus: "on_the_way",
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 2️⃣ Socket.io broadcast to customer tracking page
  io.to(`order:${orderId}`).emit("location:update", {
    lat,
    lng,
    driverId,
    status: "on_the_way",
    ts: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    lat,
    lng,
    orderId,
  });
}
