const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

/** Universal WhatsApp sender with logging */
export async function sendWhatsAppMessage(msg: any) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
  console.log("📤 [WA SEND] Request →", JSON.stringify(msg, null, 2));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    const text = await res.text();
    console.log("📬 [WA RESPONSE]", res.status, text);

    if (!res.ok) throw new Error(`WA API Error ${res.status}: ${text}`);
    return text;
  } catch (err) {
    console.error("🚨 [WA SEND ERROR]", err);
    return null;
  }
}
