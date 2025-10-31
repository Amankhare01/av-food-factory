export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleIncoming } from "@/lib/botLogic";

/**
 * 🔐 Webhook verification (GET)
 * Used once when setting up webhook on Meta dashboard
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

  console.log("🔍 [VERIFY]", { mode, token });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * 📦 Incoming Webhook (POST)
 * Receives all messages from WhatsApp Cloud API
 */
export async function POST(req: NextRequest) {
  console.log("📩 [WEBHOOK HIT]");
  const rawBody = await req.text();

  try {
    const data = JSON.parse(rawBody);
    const entry = data.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages || [];

    if (!messages.length) {
      console.log("ℹ️ No message payload found");
      return NextResponse.json({ success: true });
    }

    // Process each message
    for (const m of messages) {
      console.log("💬 [RAW MESSAGE]", JSON.stringify(m, null, 2));

      // Build normalized message object
      const waMsg = {
        id: m.id,
        from: m.from,
        timestamp: m.timestamp,
        type: m.type,
        text: m.text || null,
        interactive: m.interactive || null,
        // Flatten interactive fields for safety
        button_reply: m.interactive?.button_reply || null,
        list_reply: m.interactive?.list_reply || null,
        location: m.location || null,
      };

      console.log("🧠 [PARSED MESSAGE]", waMsg);

      try {
        await handleIncoming(waMsg);
      } catch (innerErr) {
        console.error("❌ [BOT LOGIC ERROR]", innerErr);
      }
    }

    // Give time for logs to flush
    await new Promise((r) => setTimeout(r, 300));
    console.log("✅ [WEBHOOK COMPLETED]");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ [WEBHOOK ERROR]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 });
  }
}
