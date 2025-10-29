import connectDB from "./mongodb";
import { Order } from "../models/Order";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ADMIN_PHONE = "917317275160"; // must be in E.164 format (no +)

// 🧠 WhatsApp Send Function (with diagnostics)
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

// ----- Static Menu -----
export const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 80 },
];

// In-memory user sessions
const sessions: Record<string, any> = {};

// 🧩 Main Bot Logic
export async function handleIncomingMessage(message: any) {
  const from = message.from;
  const text = message.text?.body?.trim().toLowerCase();
  const buttonId = message.interactive?.button_reply?.id;
  const listId = message.interactive?.list_reply?.id;
  const action = (buttonId || listId || text || "").trim().toLowerCase();

  if (!sessions[from]) sessions[from] = { step: "start", cart: [] };
  const user = sessions[from];

  console.log("📩 Incoming action:", action);

  // 🟢 Start / Greeting
  if (["hi", "hello", "menu", "start"].includes(action)) {
    user.step = "menu";
    await sendWhatsAppMessage(buildMainMenu(from));
    return;
  }

  // 🟢 View Menu
  if (action === "view_menu") {
    user.step = "choose_item";
    await sendWhatsAppMessage(buildMenuList(from));
    return;
  }

  // 🟢 Item Selected
  if (action.startsWith("item_")) {
    const itemId = action.replace("item_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) {
      await sendWhatsAppMessage(buildText(from, "❌ Item not found."));
      return;
    }
    user.currentItem = item;
    user.step = "quantity";
    await sendWhatsAppMessage(buildQuantityButtons(from, item.name));
    return;
  }

  // 🟢 Quantity Chosen
  if (action.startsWith("qty_")) {
    const qty = Number(action.replace("qty_", ""));
    if (!user.currentItem) {
      await sendWhatsAppMessage(buildText(from, "Please select an item first."));
      return;
    }
    user.cart.push({ ...user.currentItem, qty });
    user.currentItem = null;
    user.step = "cart_actions";

    await sendWhatsAppMessage(
      buildText(from, `🛒 Added *${qty} × ${user.cart[user.cart.length - 1].name}* to your cart.`)
    );
    await sendWhatsAppMessage(buildCartOptions(from));
    return;
  }

  // 🟢 Add More Items
  if (action === "add_more") {
    user.step = "choose_item";
    await sendWhatsAppMessage(buildMenuList(from));
    return;
  }

  // 🟢 View Cart
  if (action === "view_cart") {
    if (!user.cart.length) {
      await sendWhatsAppMessage(buildText(from, "🛒 Your cart is empty."));
      await sendWhatsAppMessage(buildCartOptions(from));
      return;
    }
    await sendWhatsAppMessage(buildCartSummary(from, user.cart));
    return;
  }

  // 🟢 Remove Items
  if (action === "remove_item") {
    if (!user.cart.length) {
      await sendWhatsAppMessage(buildText(from, "Your cart is already empty."));
      return;
    }
    user.step = "removing";
    await sendWhatsAppMessage(buildRemoveItemList(from, user.cart));
    return;
  }

  if (action.startsWith("del_")) {
    const index = Number(action.replace("del_", ""));
    if (isNaN(index) || index < 0 || index >= user.cart.length) {
      await sendWhatsAppMessage(buildText(from, "❌ Invalid selection."));
      return;
    }
    const removed = user.cart.splice(index, 1)[0];
    await sendWhatsAppMessage(buildText(from, `🗑️ Removed *${removed.name}* from your cart.`));
    await sendWhatsAppMessage(buildCartOptions(from));
    user.step = "cart_actions";
    return;
  }

  // 🟢 Proceed to Checkout
  if (action === "proceed_checkout") {
    if (!user.cart.length) {
      await sendWhatsAppMessage(buildText(from, "🛒 Your cart is empty."));
      return;
    }
    user.step = "delivery";
    await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
    return;
  }

  // 🟢 Choose Delivery Type
  if (["delivery", "pickup"].includes(action)) {
    user.deliveryType = action;
    user.step = "contact";
    await sendWhatsAppMessage(
      buildText(from, "📞 Please share your *10-digit contact number* to proceed.")
    );
    return;
  }

  // 🟢 Enter Contact Number
  if (user.step === "contact" && /^\d{10}$/.test(text)) {
    user.contact = text;
    if (user.deliveryType === "delivery") {
      user.step = "address";
      await sendWhatsAppMessage(
        buildText(
          from,
          "🏠 Please type your *full delivery address* including area and pincode.\n\nExample:\n`123 MG Road, Lucknow 226010`"
        )
      );
    } else {
      user.step = "confirm";
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
    }
    return;
  }

  // 🟢 Address / Pincode
  if (user.step === "address" && text) {
    const pin = text.match(/\b\d{6}\b/);
    if (!pin) {
      await sendWhatsAppMessage(
        buildText(from, "⚠️ Please include a valid 6-digit *pincode* in your address.")
      );
      return;
    }
    user.address = text.trim();
    user.pincode = pin[0];
    user.step = "confirm";

    await sendWhatsAppMessage(buildText(from, "✅ Address saved successfully!"));
    await sendWhatsAppMessage(buildConfirmOrderButton(from));
    return;
  }

  // 🟢 Confirm Order
  if (action === "confirm_order") {
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

    // Notify Admin
    const adminMsg = `📦 *New Order Received!*\n\nFrom: ${from}\nContact: ${
      user.contact
    }\nType: ${user.deliveryType}\n\n${summary}\nTotal: ₹${total}\n\n${
      user.deliveryType === "delivery"
        ? `🏠 Address: ${user.address}`
        : "🏬 Pickup order"
    }`;

    console.log("📤 Sending admin order message...");
    await sendWhatsAppMessage(buildText(ADMIN_PHONE, adminMsg));

    // Save Order to DB
    console.log("💾 Saving order to DB...");
    console.log("from before the saveorde call = ",from);
    console.log("user before the saveorder call = ",user);
    await saveOrder(from, user);

    await sendWhatsAppMessage(
      buildText(from, "🧾 Your order has been saved successfully! Thank you 🙏")
    );

    user.cart = [];
    user.step = "done";
    return;
  }

  // 🟠 Fallback
  await sendWhatsAppMessage(buildMainMenu(from));
}

// ----- UI Builders -----
export function buildText(to: string, bodyText: string) {
  return { messaging_product: "whatsapp", to, type: "text", text: { body: bodyText } };
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
            rows: MENU.map((i) => ({
              id: `item_${i.id}`,
              title: i.name,
              description: `₹${i.price}`,
            })),
          },
        ],
      },
    },
  };
}

export function buildQuantityButtons(to: string, itemName: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🍛 How many *${itemName}* would you like?` },
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

export function buildCartOptions(to: string) {
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

export function buildCartSummary(to: string, cart: any[]) {
  const summary = cart.map((i, idx) => `${idx + 1}. ${i.name} ×${i.qty} — ₹${i.price * i.qty}`).join("\n");
  const total = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🧾 *Your Cart*\n\n${summary}\n\nSubtotal: ₹${total}\n\nWhat would you like to do next?`,
      },
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

export function buildRemoveItemList(to: string, cart: any[]) {
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
            rows: cart.map((item, idx) => ({
              id: `del_${idx}`,
              title: item.name,
              description: `Qty: ${item.qty} — ₹${item.price * item.qty}`,
            })),
          },
        ],
      },
    },
  };
}

export function buildDeliveryTypeButtons(to: string) {
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

export function buildConfirmOrderButton(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Ready to confirm your order?" },
      action: {
        buttons: [{ type: "reply", reply: { id: "confirm_order", title: "✅ Confirm Order" } }],
      },
    },
  };
}

// 🧾 Save order to MongoDB
async function saveOrder(from: string, user: any) {
  try {
    console.log("🧠 Connecting DB before save...");
    await connectDB();
    console.log("✅ DB connected, now saving...");
    console.log("user cart length = ",user.cart?.length);
    if (!user.cart?.length) {
      console.log("⚠️ No items in cart, skipping save.");
      return;
    }
    const subtotal = user.cart.reduce((s: number, c: any) => s + c.price * c.qty, 0);
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
    console.log("✅ Order saved to MongoDB:", order._id);
    return order;
  } catch (err) {
    console.error("❌ Error saving order:", err);
  }
}
