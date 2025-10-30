import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/botLogic";

// ✅ Webhook Verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ✅ Webhook Message Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // ✅ only process if messages exist
    const message = value?.messages?.[0];
    if (!message) {
      console.log("⚠️ Skipping non-message webhook (status/update)");
      return NextResponse.json({ ok: true });
    }

    // ✅ ignore echo messages (sent by your own WhatsApp number)
    if (message.from === value.metadata?.phone_number_id) {
      console.log("⚠️ Ignored echo message from our own number.");
      return NextResponse.json({ ok: true });
    }

    await handleIncomingMessage(message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}

