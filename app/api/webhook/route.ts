export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { handleIncoming } from "@/lib/botLogic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  console.log("📩 [WEBHOOK HIT]");
  const rawBody = await req.text();

  try {
    const data = JSON.parse(rawBody);
    const messages = data.entry?.[0]?.changes?.[0]?.value?.messages || [];
    if (!messages.length) {
      console.log("ℹ️ No messages");
      return NextResponse.json({ success: true });
    }

    for (const m of messages) {
      console.log("💬 [RAW MESSAGE]", JSON.stringify(m, null, 2));

      const waMsg = {
        id: m.id,
        from: m.from,
        timestamp: m.timestamp,
        type: m.type,
        text: m.text,
        interactive: m.interactive,
        button_reply: m.interactive?.button_reply,
        list_reply: m.interactive?.list_reply,
        location: m.location,
      };

      console.log("🧠 [PARSED MESSAGE]", waMsg);
      await handleIncoming(waMsg);
    }

    await new Promise((r) => setTimeout(r, 300));
    console.log("✅ [WEBHOOK COMPLETE]");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ [WEBHOOK ERROR]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 });
  }
}
