import { NextRequest, NextResponse } from "next/server";
import { handleIncoming, sendWhatsAppMessage } from "@/lib/botLogic";

// 🔹 Webhook Verification (Meta setup step)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Verify token (must match META_VERIFY_TOKEN in .env)
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("✅ WhatsApp webhook verified successfully.");
      return new NextResponse(challenge, { status: 200 });
    }

    console.warn("⚠️ Invalid webhook verification attempt.");
    return new NextResponse("Forbidden", { status: 403 });
  } catch (err) {
    console.error("❌ Webhook GET error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

// 🔹 Message Event Handling
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic safety guard
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // No messages (may be status update or delivery receipt)
      return NextResponse.json({ ok: true });
    }

    const from = message.from; // User phone number (no '+')
    const type = message.type;

    // Normalize message content
    const userMsg = (() => {
      if (type === "text") return message.text?.body?.trim() || "";
      if (type === "interactive") {
        const btn = message.interactive?.button_reply;
        const list = message.interactive?.list_reply;
        if (btn?.id) return `__POSTBACK__:${btn.id}`;
        if (list?.id) return `__POSTBACK__:${list.id}`;
      }
      if (type === "button") {
        const id = message.button?.payload || message.button?.text;
        if (id) return `__POSTBACK__:${id}`;
      }
      return "";
    })();

    // Log for debug (optional)
    console.log("📩 Incoming from:", from, "| Message:", userMsg);

    // Hand over to main bot logic
    await handleIncoming({ from, userMsg });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Webhook POST error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Error" },
      { status: 200 } // still 200 so Meta doesn't retry infinitely
    );
  }
}
