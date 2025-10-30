import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MessageLog } from "@/models/MessageLog";
import { handleIncoming } from "@/lib/botLogic";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;

function verifySignature(req: NextRequest, rawBody: string) {
  // NOTE: True X-Hub-Signature verification uses your APP SECRET (not verify token).
  // Since no APP SECRET is provided, we keep this as a non-blocking placeholder.
  const sig = req.headers.get("x-hub-signature-256");
  if (!sig) return false;
  try {
    const hmac = crypto.createHmac("sha256", VERIFY_TOKEN);
    hmac.update(rawBody, "utf8");
    const expected = `sha256=${hmac.digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Optional signature check (see note above)
  try {
    verifySignature(req, rawBody);
  } catch (e) {
    console.warn("Signature verify skipped:", (e as Error).message);
  }

  await connectDB();

  try {
    const data = JSON.parse(rawBody);
    const changes = data.entry?.[0]?.changes?.[0]?.value;
    const messages = changes?.messages || [];

    for (const m of messages) {
      const waMessageId = m.id;

      // Idempotency
      const seen = await MessageLog.findOne({ waMessageId });
      if (seen) continue;
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

      await handleIncoming(waMsg);
    }

    // Always 200 to acknowledge to Meta
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook POST error:", err);
    // Still 200 to avoid repeated retries from Meta
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
