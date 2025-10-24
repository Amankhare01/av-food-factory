import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { to, message, type = "text" } = await req.json();
    if (!to || !message)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let msg: any;
    if (type === "text")
      msg = { messaging_product: "whatsapp", to, type: "text", text: { body: message } };
    else
      msg = { messaging_product: "whatsapp", to, type, [type]: { link: message } };

    await sendWhatsAppMessage(msg);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("sendMessage error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
