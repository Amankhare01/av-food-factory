const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER!; // E.164 without '+'

async function metaFetch(body: any) {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("WA API error", res.status, text);
    throw new Error(`WA API ${res.status}`);
  }
  return text;
}

export async function sendText(to: string, body: string) {
  return metaFetch({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  });
}

export async function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  return metaFetch({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: { buttons: buttons.map((b) => ({ type: "reply", reply: b })) },
    },
  });
}

export async function sendList(
  to: string,
  header: string,
  body: string,
  sections: Array<{ title: string; rows: { id: string; title: string; description?: string }[] }>
) {
  return metaFetch({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: header },
      body: { text: body },
      action: { sections },
    },
  });
}

export async function notifyAdmin(body: string) {
  return sendText(ADMIN_NUMBER, body);
}
