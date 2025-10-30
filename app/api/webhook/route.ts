import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MessageLog } from "@/models/MessageLog";
import { handleIncoming } from "@/lib/botLogic";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

/** Optional signature check — using VERIFY_TOKEN as fallback */
// function verifySignature(req: NextRequest, rawBody: string) {
//   const sig = req.headers.get("x-hub-signature-256");
//   if (!sig) return false;
//   try {
//     const hmac = crypto.createHmac("sha256", VERIFY_TOKEN);
//     hmac.update(rawBody, "utf8");
//     const expected = `sha256=${hmac.digest("hex")}`;
//     return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
//   } catch (err) {
//     console.error("❌ Signature verify error:", err);
//     return false;
//   }
// }

/** ✅ Webhook verification (GET) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("🔍 VERIFY:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("⚠️ Webhook verification failed.");
  return new NextResponse("Forbidden", { status: 403 });
}

/** ✅ Main POST webhook — handle incoming messages */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  console.log("📩 Incoming webhook hit!");




  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    return NextResponse.json({ success: false, error: "DB connection failed" }, { status: 500 });
  }

  try {
    const data = JSON.parse(rawBody);
    console.log("📦 Payload:", JSON.stringify(data, null, 2));

    const changes = data.entry?.[0]?.changes?.[0]?.value;
    const messages = changes?.messages || [];

    if (!messages.length) {
      console.log("ℹ️ No messages found in payload");
      return NextResponse.json({ success: true, message: "No messages" });
    }

    for (const m of messages) {
      console.log("💬 Processing message:", m.id, m.from, m.type);

      // Check duplicate message
      const seen = await MessageLog.findOne({ waMessageId: m.id });
      if (seen) {
        console.log("⏭️ Duplicate message skipped:", m.id);
        continue;
      }
      await MessageLog.create({ waMessageId: m.id });

      const waMsg = {
        id: m.id,
        from: m.from,
        timestamp: m.timestamp,
        type: m.type,
        text: m.text,
        interactive: m.interactive,
        location: m.location,
      };

      try {
        console.log("⚙️ Passing to bot logic...");
        await handleIncoming(waMsg);
        console.log("✅ Message handled successfully:", m.id);
      } catch (err) {
        console.error("❌ Bot logic error for", m.id, ":", err);
      }
    }

    console.log("✅ Webhook completed.");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook POST error:", err);
    // Always respond 200 to avoid Meta retries
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 });
  }
}
