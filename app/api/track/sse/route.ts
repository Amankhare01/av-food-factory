import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { locationChannels } from "@/lib/locationChannels";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectDB();

  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const token = url.searchParams.get("t");

  if (!orderId || !token) {
    return new Response("Missing params", { status: 400 });
  }

  const order = await Order.findOne({ _id: orderId, trackingToken: token });
  if (!order) {
    return new Response("Unauthorized", { status: 401 });
  }

  // FIX: define client here so both start() and cancel() can access it
  let client: any = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Create channel if not exists
      if (!locationChannels[orderId]) {
        locationChannels[orderId] = [];
      }

      // Assign client writer
      client = {
        write: (msg: string) => {
          controller.enqueue(encoder.encode(msg));
        },
      };

      // Add client to channel list
      locationChannels[orderId].push(client);

      // Notify browser that SSE is ready
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ ready: true })}\n\n`
        )
      );
    },

    cancel() {
      // Remove client when browser closes connection
      if (locationChannels[orderId]) {
        locationChannels[orderId] = locationChannels[orderId].filter(
          (c: any) => c !== client
        );
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
