/**
 * 🧩 WhatsApp Cloud API Sender
 */
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;

export async function sendWhatsAppMessage(msg: any) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  try {
    console.log("\n📤 [WA SEND INIT]");
    console.log("➡️ URL:", url);
    console.log("🧾 Payload:", JSON.stringify(msg, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    const text = await res.text();
    console.log(`📬 [WA RESPONSE] ${res.status}: ${text}`);

    if (!res.ok) {
      console.error("🚨 [WA SEND ERROR]", text);
      throw new Error(`WA API Error ${res.status}: ${text}`);
    }

    console.log("✅ [WA SEND SUCCESS]");
    return { ok: true };
  } catch (err: any) {
    console.error("❌ [WA SEND EXCEPTION]", err?.message || err);
    return { ok: false, error: err?.message };
  }
}
