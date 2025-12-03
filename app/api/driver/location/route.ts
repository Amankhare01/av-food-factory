import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";

// Global memory event emitters per order
const channels: Record<string, any[]> = {};

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

  // Save location in DB
  const loc = await Location.create({
    driverId,
    orderId,
    lat,
    lng,
  });

  // Notify SSE listeners (if any)
  if (channels[orderId]) {
    channels[orderId].forEach((res) => {
      res.write(`data: ${JSON.stringify({ lat, lng, ts: loc.ts })}\n\n`);
    });
  }

  return NextResponse.json({ ok: true });
}

// Export channel store so SSE route can access it
export const locationChannels = channels;
