import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/whatsapp/webhookUtils";
import { handleIncomingMessage } from "@/lib/whatsapp/handleMessage";

// ✅ Verification
export async function GET(req: NextRequest) {
  return verifyWebhook(req);
}

// ✅ Incoming messages
export async function POST(req: NextRequest) {
  try {
    console.log("🚀 WhatsApp Webhook Triggered");
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("⚠️ No messages (status or delivery update).");
      return NextResponse.json("EVENT_RECEIVED", { status: 200 });
    }

    console.log("🟢 Message received:", message);
    await handleIncomingMessage(message);

    return NextResponse.json("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
