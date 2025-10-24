

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const ADMIN_PHONE = "916306512288";

// ----- WhatsApp Send Function -----
export async function sendWhatsAppMessage(msg: any) {
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });
    const text = await res.text();
    console.log("📤 WA API Response:", res.status, text);
  } catch (err) {
    console.error("❌ sendWhatsAppMessage error:", err);
  }
}

// ----- Menu -----
export const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 80 },
];

// ----- Main Bot Logic -----
export async function handleIncomingMessage(message: any) {
  const from = message.from;
  const text = message.text?.body?.trim().toLowerCase();
  const buttonId = message.interactive?.button_reply?.id;
  const listId = message.interactive?.list_reply?.id;
  const action = buttonId || listId || text;

  console.log("📩 Incoming:", action);

  // 👋 Greetings
  if (["hi", "hello", "menu", "start"].includes(action)) {
    await sendWhatsAppMessage(buildMainMenu(from));
    return;
  }

  // 🍽️ View Menu
  if (action === "view_menu") {
    await sendWhatsAppMessage(buildMenuList(from));
    return;
  }

  // 🍛 Item Selected
  if (action.startsWith("item_")) {
    const itemId = action.replace("item_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) {
      await sendWhatsAppMessage(buildText(from, "❌ Item not found."));
      return;
    }
    await sendWhatsAppMessage(buildConfirmItemButtons(from, item.name, item.price, item.id));
    return;
  }

  // ✅ Confirm Order
  if (action.startsWith("confirm_")) {
    const itemId = action.replace("confirm_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) {
      await sendWhatsAppMessage(buildText(from, "❌ Item not found."));
      return;
    }

    // Send confirmation to user
    await sendWhatsAppMessage(
      buildText(from, `✅ Your order for *${item.name}* (₹${item.price}) has been placed! 🍴`)
    );

    // Send alert to admin
    await sendWhatsAppMessage(
      buildText(
        ADMIN_PHONE,
        `📦 *New Order Received!*\n\nFrom: ${from}\nItem: ${item.name}\nPrice: ₹${item.price}`
      )
    );

    return;
  }

  // Default fallback
  await sendWhatsAppMessage(buildMainMenu(from));
}

// ----- Message Builders -----
export function buildText(to: string, bodyText: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: bodyText },
  };
}

export function buildMainMenu(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "👋 Welcome to AV Food Factory! What would you like to do?" },
      action: {
        buttons: [{ type: "reply", reply: { id: "view_menu", title: "🍽️ View Menu" } }],
      },
    },
  };
}

export function buildMenuList(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🍴 AV Food Factory — Menu" },
      body: { text: "Select your favorite dish:" },
      action: {
        button: "View Items",
        sections: [
          {
            title: "Available Items",
            rows: MENU.map((item) => ({
              id: `item_${item.id}`,
              title: item.name,
              description: `₹${item.price}`,
            })),
          },
        ],
      },
    },
  };
}

export function buildConfirmItemButtons(to: string, name: string, price: number, id: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `You selected *${name}* — ₹${price}\nConfirm your order?` },
      action: {
        buttons: [
          { type: "reply", reply: { id: `confirm_${id}`, title: "✅ Confirm Order" } },
        ],
      },
    },
  };
}
