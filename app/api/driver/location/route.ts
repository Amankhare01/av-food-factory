// app/api/driver/location/route.ts

import connectDB from "@/lib/mongodb";
import { io } from "@/lib/socket";
import Location from "@/models/Location";

export async function POST(req: Request) {
  await connectDB();

  const apiKey = req.headers.get("x-driver-key");
  if (apiKey !== process.env.DRIVER_KEY)
    return new Response("Unauthorized", { status: 401 });

  const { driverId, orderId, lat, lng } = await req.json();

  const loc = await Location.create({
    driverId,
    orderId,
    lat,
    lng,
  });

  io.to(`order:${orderId}`).emit("location:update", {
    lat,
    lng,
    driverId,
    ts: loc.ts,
  });

  return Response.json({ ok: true });
}
