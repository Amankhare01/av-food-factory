import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { locationChannels } from "@/lib/locationChannels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectDB();

  const url = new URL(req.url);
  const rawOrderId = url.searchParams.get("orderId");
  const token = url.searchParams.get("t");

  if (!rawOrderId || !token) {
    return new Response("Missing params", { status: 400 });
  }

  const orderId = String(rawOrderId).trim(); // ⭐ fix

  const order = await Order.findOne({ _id: orderId, trackingToken: token });
  if (!order) {
    return new Response("Unauthorized", { status: 401 });
  }

  let client: any = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      if (!locationChannels[orderId]) {
        locationChannels[orderId] = new Set();
      }

      client = {
        write: (msg: string) => controller.enqueue(encoder.encode(msg)),
      };

      locationChannels[orderId].add(client);

      // Ready signal
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ ready: true })}\n\n`)
      );
    },

    cancel() {
      if (locationChannels[orderId]) {
        locationChannels[orderId].delete(client);

        if (locationChannels[orderId].size === 0) {
          delete locationChannels[orderId];
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
