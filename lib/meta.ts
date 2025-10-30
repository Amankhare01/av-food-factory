const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER!; // E.164 without '+'

/** Shared fetch helper with logging */
async function metaFetch(body: any) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  console.log("📤 [WA SEND] →", JSON.stringify(body, null, 2));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("📬 [WA RESPONSE]", res.status, text);

    if (!res.ok) {
      console.error("❌ WhatsApp API error:", res.status, text);
      throw new Error(`WA API ${res.status}: ${text}`);
    }

    return text;
  } catch (err) {
    console.error("🚨 [WA SEND ERROR]:", err);
    throw err;
  }
}

/** Send a plain text message */
export async function sendText(to: string, body: string) {
  console.log(`📝 sendText() → ${to}:`, body);
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  };
  return metaFetch(payload);
}

/** Send buttons (interactive quick replies) */
export async function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  console.log(`🎛 sendButtons() → ${to}:`, body);
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({ type: "reply", reply: b })),
      },
    },
  };
  return metaFetch(payload);
}

/** Send list (category menu) */
export async function sendList(
  to: string,
  header: string,
  body: string,
  sections: Array<{
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }>
) {
  console.log(`📋 sendList() → ${to}:`, header);
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: header },
      body: { text: body },
      action: { sections },
    },
  };
  return metaFetch(payload);
}

/** Notify admin for each new order */
export async function notifyAdmin(body: string) {
  console.log(`📢 notifyAdmin() → Admin ${ADMIN_NUMBER}:`, body);
  return sendText(ADMIN_NUMBER, body);
}
