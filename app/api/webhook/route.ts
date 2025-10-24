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

// ✅ Webhook Message Receiver
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!entry) return NextResponse.json({ received: true });

    await handleIncomingMessage(entry);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
