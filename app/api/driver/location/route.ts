import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";
import { locationChannels } from "@/lib/locationChannels";

export async function POST(req: Request) {
  await connectDB();

  const apiKey = req.headers.get("x-driver-key");
  if (apiKey !== process.env.DRIVER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, orderId, lat, lng } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const loc = await Location.create({
    driverId,
    orderId,
    lat,
    lng,
  });

  // Notify any SSE listeners
  if (locationChannels[orderId]) {
    locationChannels[orderId].forEach((client) => {
      client.write(`data: ${JSON.stringify({ lat, lng, ts: loc.ts })}\n\n`);
    });
  }

  return NextResponse.json({ ok: true });
}
