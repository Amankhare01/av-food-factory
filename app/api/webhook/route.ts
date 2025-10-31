import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MessageLog } from "@/models/MessageLog";
import { handleIncoming } from "@/lib/botLogic";
import { sendWhatsAppMessage } from "@/lib/meta";

export const runtime = "nodejs"; // needed for Node fetch

/** Webhook verification (Meta GET) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

  console.log("🔍 Webhook verification:", { mode, token });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Handle incoming WhatsApp messages (Meta POST) */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  console.log("📩 Incoming webhook hit!");

  try {
    await connectDB();
    const data = JSON.parse(rawBody);
    console.log("📦 Payload:", JSON.stringify(data, null, 2));

    const messages = data.entry?.[0]?.changes?.[0]?.value?.messages || [];
    if (!messages.length) {
      console.log("ℹ️ No messages found in payload");
      return NextResponse.json({ success: true });
    }

    for (const m of messages) {
      const waMessageId = m.id;
      if (await MessageLog.findOne({ waMessageId })) {
        console.log("⏭️ Duplicate message skipped:", waMessageId);
        continue;
      }
      await MessageLog.create({ waMessageId });

      const waMsg = {
        id: m.id,
        from: m.from,
        timestamp: m.timestamp,
        type: m.type,
        text: m.text,
        interactive: m.interactive,
        location: m.location,
      };

      console.log("💬 Processing incoming message:", waMsg);

      // Get replies from bot logic
      const replies = await handleIncoming(waMsg);

      // Send each reply via Meta API
      for (const reply of replies) {
        try {
          await sendWhatsAppMessage(reply);
          console.log("✅ Message sent successfully to", reply.to);
        } catch (err) {
          console.error("❌ Send failed for", reply.to, ":", err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook POST error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
