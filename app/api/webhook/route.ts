import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/botLogic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // ✅ Respond immediately to Meta
    const ack = NextResponse.json({ status: "received" }, { status: 200 });

    if (message) {
      // Process asynchronously (non-blocking)
      handleIncomingMessage(message).catch(err =>
        console.error("❌ Bot Error:", err)
      );
    }

    return ack;
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
