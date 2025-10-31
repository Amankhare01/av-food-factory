// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleIncoming, sendWhatsAppMessage } from "@/lib/botLogic";

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  } catch (err) {
    console.error("Webhook GET error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

// Messages (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic guard
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];
    if (!messages) return NextResponse.json({ ok: true });

    const from = messages.from; // user phone (E.164 without +)
    const type = messages.type;

    // Normalize user text or interactive reply
    const userMsg = (() => {
      if (type === "text") return messages.text?.body?.trim() || "";
      if (type === "interactive") {
        const nbtn = messages.interactive?.button_reply;
        const nlist = messages.interactive?.list_reply;
        if (nbtn?.id) return `__POSTBACK__:${nbtn.id}`;
        if (nlist?.id) return `__POSTBACK__:${nlist.id}`;
      }
      if (type === "button") {
        const id = messages.button?.payload || messages.button?.text;
        if (id) return `__POSTBACK__:${id}`;
      }
      // Contacts/Location/etc not used here
      return "";
    })();

    await handleIncoming({ from, userMsg, raw: messages });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook POST error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 200 });
  }
}
