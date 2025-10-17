export async function sendWhatsAppMessage(msg: any) {
  try {
    console.log("📤 Sending WhatsApp Message:", JSON.stringify(msg, null, 2));

    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    const text = await res.text();
    console.log("WhatsApp API Response:", res.status, text);

    if (!res.ok) throw new Error(`Failed to send: ${res.status} ${text}`);
    return text;
  } catch (err) {
    console.error("❌ sendWhatsAppMessage error:", err);
  }
}
                                      