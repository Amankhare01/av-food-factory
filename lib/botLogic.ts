import connectDB from "./mongodb";
import { Order } from "../models/Order";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ADMIN_PHONE = "917317275160";

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
    console.log("📤 WA:", res.status, await res.text());
  } catch (err) {
    console.error("❌ sendWhatsAppMessage error:", err);
  }
}

export const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 80 },
];

const sessions: Record<string, any> = {};
const processed = new Set<string>();

export async function handleIncomingMessage(message: any) {
  const msgId = message.id;
  const from = message.from;
  const text = message.text?.body?.trim();
  const lowerText = text?.toLowerCase();
  const btn = message.interactive?.button_reply?.id;
  const list = message.interactive?.list_reply?.id;
  const action = (btn || list || lowerText || "").trim().toLowerCase();

  // ✅ prevent duplicate triggers
  if (processed.has(msgId)) {
    console.log("⚠️ Duplicate ignored:", msgId);
    return;
  }
  processed.add(msgId);
  setTimeout(() => processed.delete(msgId), 600000);

  if (!sessions[from]) sessions[from] = { step: "start", cart: [], _confirmed: false };
  const user = sessions[from];
  console.log("📩 Incoming:", action, "| step:", user.step);

  // ✅ handle text-based steps first (before switch)
  if (user.step === "contact" && /^\d{10}$/.test(lowerText)) {
    user.contact = lowerText;
    if (user.deliveryType === "delivery") {
      user.step = "address";
      await sendWhatsAppMessage(
        buildText(from, "🏠 Please type your *full delivery address* including area and pincode.")
      );
    } else {
      user.step = "confirm";
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
    }
    return;
  }

  if (user.step === "address" && text) {
    const pin = text.match(/\b\d{6}\b/);
    if (!pin) {
      await sendWhatsAppMessage(buildText(from, "⚠️ Please include a valid 6-digit *pincode* in your address."));
      return;
    }
    user.address = text.trim();
    user.pincode = pin[0];
    user.step = "confirm";
    await sendWhatsAppMessage(buildText(from, "✅ Address saved successfully!"));
    await sendWhatsAppMessage(buildConfirmOrderButton(from));
    return;
  }

  // ✅ main switch for button or list actions
  switch (action) {
    case "hi":
    case "hello":
    case "menu":
    case "start":
      user.step = "menu";
      await sendWhatsAppMessage(buildMainMenu(from));
      break;

    case "view_menu":
      user.step = "choose_item";
      await sendWhatsAppMessage(buildMenuList(from));
      break;

    case "add_more":
      user.step = "choose_item";
      await sendWhatsAppMessage(buildMenuList(from));
      break;

    case "view_cart":
      if (!user.cart.length) {
        await sendWhatsAppMessage(buildText(from, "🛒 Cart is empty."));
        await sendWhatsAppMessage(buildCartOptions(from));
      } else {
        await sendWhatsAppMessage(buildCartSummary(from, user.cart));
      }
      break;

    case "remove_item":
      if (!user.cart.length)
        return await sendWhatsAppMessage(buildText(from, "Your cart is already empty."));
      user.step = "removing";
      await sendWhatsAppMessage(buildRemoveItemList(from, user.cart));
      break;

    case "proceed_checkout":
      if (!user.cart.length)
        return await sendWhatsAppMessage(buildText(from, "🛒 Cart is empty."));
      user.step = "delivery";
      await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
      break;

    case "delivery":
    case "pickup":
      user.deliveryType = action;
      user.step = "contact";
      await sendWhatsAppMessage(buildText(from, "📞 Please share your *10-digit contact number*"));
      break;

    case "confirm_order":
      if (user._confirmed) {
        console.log("⚠️ duplicate confirm ignored");
        return;
      }
      if (!user.cart?.length) {
        console.log("⚠️ empty cart confirm blocked");
        return;
      }
      user._confirmed = true;
      setTimeout(() => (user._confirmed = false), 900000);

      const total = user.cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);
      const summary = user.cart.map((i: any) => `${i.name} ×${i.qty} — ₹${i.price * i.qty}`).join("\n");

      await sendWhatsAppMessage(
        buildText(
          from,
          `✅ *Order Confirmed!*\n\n${summary}\nTotal: ₹${total}\n\n${
            user.deliveryType === "delivery"
              ? `📍 *Address:*\n${user.address}`
              : "🏬 *Pickup order confirmed!*"
          }\n\nThank you for ordering with AV Food Factory! 🍴`
        )
      );

      const adminText = `📦 *New Order*\nFrom: ${from}\n📞 ${user.contact}\nType: ${user.deliveryType}\n\n${summary}\nTotal: ₹${total}\n\n${
        user.deliveryType === "delivery" ? `🏠 ${user.address}` : "Pickup order"
      }`;
      await sendWhatsAppMessage(buildText(ADMIN_PHONE, adminText));

      await saveOrder(from, user);
      await sendWhatsAppMessage(buildText(from, "🧾 Order saved successfully! 🙏"));
      user.cart = [];
      user.step = "done";
      break;

    default:
      // only show fallback if no other step in progress
      if (user.step === "done" || user.step === "start") {
        await sendWhatsAppMessage(buildMainMenu(from));
      } else {
        console.log("ℹ️ ignored unrelated text during step:", user.step);
      }
  }
}


// ----- Builders -----
function buildText(to: string, body: string) {
  return { messaging_product: "whatsapp", to, type: "text", text: { body } };
}
function buildMainMenu(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "👋 Welcome to AV Food Factory! What would you like to do?" },
      action: { buttons: [{ type: "reply", reply: { id: "view_menu", title: "🍽️ View Menu" } }] },
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
      header: { type: "text", text: "🍴 AV Food Factory — Menu" },
      body: { text: "Select your favorite dish:" },
      action: {
        button: "View Items",
        sections: [
          {
            title: "Available Items",
            rows: MENU.map(i => ({ id: `item_${i.id}`, title: i.name, description: `₹${i.price}` })),
          },
        ],
      },
    },
  };
}
function buildQuantityButtons(to: string, name: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🍛 How many *${name}* would you like?` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "qty_1", title: "1" } },
          { type: "reply", reply: { id: "qty_2", title: "2" } },
          { type: "reply", reply: { id: "qty_3", title: "3" } },
        ],
      },
    },
  };
}
function buildCartOptions(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Would you like to add more items, view cart, or checkout?" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "add_more", title: "➕ Add More" } },
          { type: "reply", reply: { id: "view_cart", title: "🛒 View Cart" } },
          { type: "reply", reply: { id: "proceed_checkout", title: "✅ Checkout" } },
        ],
      },
    },
  };
}
function buildCartSummary(to: string, cart: any[]) {
  const summary = cart.map((i, idx) => `${idx + 1}. ${i.name} ×${i.qty} — ₹${i.price * i.qty}`).join("\n");
  const total = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🧾 *Your Cart*\n\n${summary}\n\nSubtotal: ₹${total}` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "add_more", title: "➕ Add More" } },
          { type: "reply", reply: { id: "remove_item", title: "🗑️ Remove Item" } },
          { type: "reply", reply: { id: "proceed_checkout", title: "✅ Checkout" } },
        ],
      },
    },
  };
}
function buildRemoveItemList(to: string, cart: any[]) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🗑️ Remove from Cart" },
      body: { text: "Select an item to remove:" },
      action: {
        button: "Select Item",
        sections: [
          {
            title: "Cart Items",
            rows: cart.map((i, idx) => ({
              id: `del_${idx}`,
              title: i.name,
              description: `Qty: ${i.qty} — ₹${i.price * i.qty}`,
            })),
          },
        ],
      },
    },
  };
}
function buildDeliveryTypeButtons(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Choose delivery type:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "delivery", title: "🚚 Delivery" } },
          { type: "reply", reply: { id: "pickup", title: "🏃 Pickup" } },
        ],
      },
    },
  };
}
function buildConfirmOrderButton(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Ready to confirm your order?" },
      action: { buttons: [{ type: "reply", reply: { id: "confirm_order", title: "✅ Confirm Order" } }] },
    },
  };
}

async function saveOrder(from: string, user: any) {
  try {
    await connectDB();
    if (!user.cart?.length) return;
    const subtotal = user.cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);
    const order = await Order.create({
      whatsappFrom: from,
      contact: user.contact,
      address: user.address || null,
      pincode: user.pincode || null,
      deliveryType: user.deliveryType,
      items: user.cart,
      subtotal,
      createdAt: new Date(),
    });
    console.log("✅ Order saved:", order._id);
  } catch (err) {
    console.error("❌ DB save error:", err);
  }
}
