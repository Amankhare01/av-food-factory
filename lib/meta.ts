/**
 * 🧩 WhatsApp Meta Cloud API Helper
 * Handles all outgoing messages to users/admins.
 */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;

/**
 * ✅ Send a WhatsApp message via Cloud API
 * @param msg - JSON payload (text / interactive / list)
 */
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
    console.log(`📬 [WA RESPONSE] ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.error("🚨 [WA SEND ERROR]", text);
      throw new Error(`WA API Error ${res.status}: ${text}`);
    }

    console.log("✅ [WA SEND SUCCESS]", text);
    return { ok: true, status: res.status, data: text };
  } catch (err: any) {
    console.error("❌ [WA SEND EXCEPTION]", err?.message || err);
    return { ok: false, error: err?.message || err };
  }
}
