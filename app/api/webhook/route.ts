export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleIncoming } from "@/lib/botLogic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

  console.log("🔍 [VERIFY]", { mode, token });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  console.log("📩 Incoming webhook hit!");
  const rawBody = await req.text();
  console.log("📦 Raw Body:", rawBody);

  try {
    const data = JSON.parse(rawBody);
    const messages = data.entry?.[0]?.changes?.[0]?.value?.messages || [];

    if (!messages.length) {
      console.log("ℹ️ No message payload found.");
      return NextResponse.json({ success: true });
    }

    for (const m of messages) {
      console.log("💬 Processing incoming:", m);
      const waMsg = {
        id: m.id,
        from: m.from,
        timestamp: m.timestamp,
        type: m.type,
        text: m.text,
        interactive: m.interactive,
      };
      await handleIncoming(waMsg);
    }

    // Give logs a moment to flush on Vercel
    await new Promise((r) => setTimeout(r, 500));
    console.log("✅ Webhook completed successfully.");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ [WEBHOOK ERROR]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 });
  }
}
