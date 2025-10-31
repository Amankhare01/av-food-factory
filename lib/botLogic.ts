// lib/botLogic.ts
// All bot logic + message builders + admin forward
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER|| "916306512288").replace("+", ""); // E.164 w/o "+"

// ---- Simple in-memory session (upgrade to Redis for serverless) ----
type Step =
  | "INIT"
  | "AWAITING_MENU"
  | "AWAITING_QTY"
  | "AWAITING_DELIVERY"
  | "AWAITING_PHONE"
  | "AWAITING_ADDRESS"
  | "AWAITING_CONFIRM";

type OrderDraft = {
  itemId?: string;
  itemName?: string;
  qty?: number;
  delivery?: "pickup" | "delivery";
  phone?: string;
  address?: string;
};

const userStates = new Map<string, { step: Step; order: OrderDraft }>();

// ---- Static Menu ----
export const MENU = [
 
  { id: "veg_biryani", name: "Veg Biryani", price: 160 },
  { id: "chicken_kebab", name: "Chicken Kebab", price: 220 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
];

// ---- WhatsApp API sender ----
export async function sendWhatsAppMessage(msg: any) {
  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("WA API Error:", res.status, text);
    } else {
      console.log("WA API OK:", res.status, text);
    }
  } catch (err) {
    console.error("sendWhatsAppMessage error:", err);
  }
}

// ---- Message Builders ----
function toWaId(e164NoPlus: string) {
  // WhatsApp "to" is the number as-is, no leading plus
  return e164NoPlus;
}

function buildText(to: string, body: string) {
  return { messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: false } };
}

function buildMenuButton(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Welcome to AV Food Factory 👨‍🍳\nTap to see our menu." },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ACTION_SHOW_MENU", title: "🍽️ Menu" } },
        ],
      },
    },
  };
}

function buildMenuList(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "AV Food Factory Menu" },
      body: { text: "Select a dish to continue:" },
      footer: { text: "Prices in INR" },
      action: {
        button: "View items",
        sections: [
          {
            title: "Popular",
            rows: MENU.map((m) => ({
              id: `MENU_${m.id}`,
              title: `${m.name}`,
              description: `₹${m.price}`,
            })),
          },
        ],
      },
    },
  };
}

function buildQtyList(to: string, itemName: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: itemName },
      body: { text: "Select quantity:" },
      footer: { text: "You can change later." },
      action: {
        button: "Choose quantity",
        sections: [
          {
            title: "Quantity",
            rows: Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
              id: `QTY_${n}`,
              title: `${n}`,
              description: n === 1 ? "Single serving" : `${n} servings`,
            })),
          },
        ],
      },
    },
  };
}


function buildDeliveryButtons(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Choose delivery type:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "DELIVERY_pickup", title: "🏪 Pickup" } },
          { type: "reply", reply: { id: "DELIVERY_delivery", title: "🚚 Delivery" } },
        ],
      },
    },
  };
}

function buildConfirmButtons(to: string, summary: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: "Confirm Order" },
      body: { text: summary },
      action: {
        buttons: [
          { type: "reply", reply: { id: "CONFIRM_YES", title: "✅ Confirm" } },
          { type: "reply", reply: { id: "CONFIRM_NO", title: "❌ Cancel" } },
        ],
      },
    },
  };
}

// ---- Validators ----
function normalizePhone(s: string) {
  const digits = s.replace(/[^\d]/g, "");
  // Expect E.164 w/o + e.g., India: 91XXXXXXXXXX (12-13 digits typical with country code)
  if (digits.length < 10) return null;
  return digits;
}
function validAddress(s: string) {
  return s.trim().length >= 6;
}

// ---- Summary ----
function summarize(order: OrderDraft) {
  const m = MENU.find((x) => x.id === order.itemId);
  const price = m ? m.price : 0;
  const subtotal = (order.qty || 0) * price;
  return (
    `🧾 *Order Summary*\n\n` +
    `• Item: ${order.itemName}\n` +
    `• Qty: ${order.qty}\n` +
    `• Type: ${order.delivery === "pickup" ? "Pickup" : "Delivery"}\n` +
    (order.phone ? `• Phone: ${order.phone}\n` : "") +
    (order.address ? `• Address: ${order.address}\n` : "") +
    (m ? `• Price: ₹${price} × ${order.qty} = ₹${subtotal}\n` : "") +
    `\nReview and confirm below.`
  );
}

// ---- Public handler ----
export async function handleIncoming({
  from,
  userMsg,
}: {
  from: string;
  userMsg: string;
  raw?: any;
}) {
  const to = toWaId(from);

  // New/Reset user
  if (!userStates.has(from)) {
    userStates.set(from, { step: "INIT", order: {} });
  }
  const state = userStates.get(from)!;

  // STEP MACHINE
  const lower = (userMsg || "").trim().toLowerCase();

  // 1) Greeter + Menu button
  if (state.step === "INIT") {
    if (lower === "hi" || lower === "hii" || lower === "hello" || lower === "hlo" || lower === "hye") {
      await sendWhatsAppMessage(buildMenuButton(to));
      state.step = "AWAITING_MENU";
      return;
    }
    // If random text, nudge
    await sendWhatsAppMessage(buildText(to, "Type *hi* to see the menu."));
    return;
  }

  // POSTBACK dispatcher
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // 2) Show menu list
  if (state.step === "AWAITING_MENU") {
    if (postback === "ACTION_SHOW_MENU") {
      await sendWhatsAppMessage(buildMenuList(to));
      return;
    }
    // Menu item chosen
    if (postback.startsWith("MENU_")) {
      const itemId = postback.replace("MENU_", "");
      const m = MENU.find((x) => x.id === itemId);
      if (!m) {
        await sendWhatsAppMessage(buildText(to, "Item not found. Please tap *Menu* again."));
        await sendWhatsAppMessage(buildMenuButton(to));
        return;
      }
      state.order.itemId = m.id;
      state.order.itemName = m.name;
      state.step = "AWAITING_QTY";
    await sendWhatsAppMessage(buildQtyList(to, m.name));

      return;
    }
    // If user typed text, re-show menu button
    await sendWhatsAppMessage(buildMenuButton(to));
    return;
  }

  // 3) Quantity
  if (state.step === "AWAITING_QTY") {
    if (postback.startsWith("QTY_")) {
      const qty = parseInt(postback.replace("QTY_", ""), 10);
      if (!Number.isFinite(qty) || qty <= 0) {
        await sendWhatsAppMessage(buildText(to, "Select a valid quantity."));
        await sendWhatsAppMessage(buildQtyList(to, state.order.itemName || "Item"));

        return;
      }
      state.order.qty = qty;
      state.step = "AWAITING_DELIVERY";
      await sendWhatsAppMessage(buildDeliveryButtons(to));
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Please choose quantity using the buttons."));
  await sendWhatsAppMessage(buildQtyList(to, state.order.itemName || "Item"));

    return;
  }

  // 4) Delivery Type
  if (state.step === "AWAITING_DELIVERY") {
    if (postback.startsWith("DELIVERY_")) {
      const t = postback.replace("DELIVERY_", "") as "pickup" | "delivery";
      if (t !== "pickup" && t !== "delivery") {
        await sendWhatsAppMessage(buildDeliveryButtons(to));
        return;
      }
      state.order.delivery = t;
      state.step = "AWAITING_PHONE";
      await sendWhatsAppMessage(
        buildText(to, "Please share your *contact number* (e.g., 91XXXXXXXXXX).")
      );
      return;
    }
    await sendWhatsAppMessage(buildDeliveryButtons(to));
    return;
  }

  // 5) Phone number
  if (state.step === "AWAITING_PHONE") {
    const normalized = normalizePhone(userMsg);
    if (!normalized) {
      await sendWhatsAppMessage(buildText(to, "Invalid number. Please enter a valid phone number."));
      return;
    }
    state.order.phone = normalized;

    // If pickup, address optional → go confirm
    if (state.order.delivery === "pickup") {
      state.step = "AWAITING_CONFIRM";
      const summary = summarize(state.order);
      await sendWhatsAppMessage(buildConfirmButtons(to, summary));
      return;
    }

    // Else delivery → ask address
    state.step = "AWAITING_ADDRESS";
    await sendWhatsAppMessage(
      buildText(
        to,
        "Please type your *full delivery address* (House no, Street, Area, City, Pincode)."
      )
    );
    return;
  }

  // 6) Address (for delivery)
  if (state.step === "AWAITING_ADDRESS") {
    if (!validAddress(userMsg)) {
      await sendWhatsAppMessage(buildText(to, "Address seems too short. Please enter full address."));
      return;
    }
    state.order.address = userMsg.trim();
    state.step = "AWAITING_CONFIRM";
    const summary = summarize(state.order);
    await sendWhatsAppMessage(buildConfirmButtons(to, summary));
    return;
  }

  // 7) Confirm
  if (state.step === "AWAITING_CONFIRM") {
    if (postback === "CONFIRM_YES") {
      const summary = summarize(state.order);
      // Send confirmation to user
      await sendWhatsAppMessage(
        buildText(
          to,
          `🎉 *Order Confirmed!*\n\n${summary}\n\nThank you for ordering with AV Food Factory.`
        )
      );
      // Forward full details to admin
      const m = MENU.find((x) => x.id === state.order.itemId);
      const price = m ? m.price : 0;
      const total = (state.order.qty || 0) * price;

      const adminText =
        `📩 *New Order*\n` +
        `From: ${from}\n` +
        `Item: ${state.order.itemName}\n` +
        `Qty: ${state.order.qty}\n` +
        `Delivery: ${state.order.delivery}\n` +
        `Phone: ${state.order.phone}\n` +
        `Address: ${state.order.address || "-"}\n` +
        (m ? `Unit: ₹${m.price}\nTotal: ₹${total}\n` : ``) +
        `\nTime: ${new Date().toLocaleString("en-IN")}`;

      await sendWhatsAppMessage(buildText(ADMIN_PHONE, adminText));

      // Reset state for next order
      userStates.set(from, { step: "INIT", order: {} });
      return;
    }
    if (postback === "CONFIRM_NO") {
      await sendWhatsAppMessage(buildText(to, "Order cancelled. Type *hi* to start again."));
      userStates.set(from, { step: "INIT", order: {} });
      return;
    }
    // Re-show confirm
    const summary = summarize(state.order);
    await sendWhatsAppMessage(buildConfirmButtons(to, summary));
    return;
  }

  // Fallback
  await sendWhatsAppMessage(buildText(to, "Type *hi* to start your order."));
}
