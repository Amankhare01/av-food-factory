import { NextResponse } from "next/server";
import { locationChannels } from "@/lib/locationChannels";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-driver-key");
  if (apiKey !== process.env.DRIVER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, orderId, lat, lng } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const id = String(orderId).trim(); // ⭐ Always stringify

  // Broadcast live GPS to SSE clients
  if (locationChannels[id]) {
    locationChannels[id].forEach((client) => {
      client.write(`data: ${JSON.stringify({ lat, lng })}\n\n`);
    });
  }

  return NextResponse.json({ ok: true });
}
