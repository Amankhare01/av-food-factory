import type { WAMsg, CartItem } from "@/lib/types";
import { sendWhatsAppMessage } from "@/lib/meta";

const ADMIN = process.env.ADMIN_WHATSAPP_NUMBER!;

/** Menu items */
const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "veg_biryani", name: "Veg Biryani", price: 160 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
];

const buildMenuList = () => [
  {
    title: "Popular Dishes 🍽️",
    rows: MENU.map((i) => ({
      id: `add_${i.id}`,
      title: `${i.name} — ₹${i.price}`,
      description: "Tap to add",
    })),
  },
];

let userCarts: Record<string, CartItem[]> = {};
let userStates: Record<string, string> = {};
let userAddress: Record<string, string> = {};
let userPhone: Record<string, string> = {};

/** Main bot handler */
export async function handleIncoming(msg: WAMsg) {
  console.log("📩 [NEW MESSAGE]", msg);

  const user = msg.from;
  const text = msg.text?.body?.trim() || "";

  if (!userCarts[user]) userCarts[user] = [];
  if (!userStates[user]) userStates[user] = "IDLE";

  const state = userStates[user];
  console.log(`👤 User: ${user} | State: ${state} | Text: "${text}"`);

  const sendText = async (body: string) => {
    console.log("💬 [SEND TEXT]", body);
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "text",
      text: { body },
    });
  };

  const sendButtons = async (body: string, buttons: { id: string; title: string }[]) => {
    const safeButtons = buttons.map((b) => ({
      type: "reply",
      reply: { id: b.id, title: b.title || b.id },
    }));
    console.log("🧩 [SEND BUTTONS]", safeButtons);
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: { buttons: safeButtons },
      },
    });
  };

  const sendList = async (header: string, body: string) => {
    console.log("🧾 [SEND LIST]");
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: header },
        body: { text: body },
        action: { sections: buildMenuList() },
      },
    });
  };

  /** Flow */

  // 1️⃣ Greeting
  if (["hi", "hello", "start"].includes(text.toLowerCase())) {
    userStates[user] = "BROWSING_MENU";
    await sendText("👋 Welcome to *AV Food Factory!* 🍱\nType *menu* to browse dishes.");
    return;
  }

  // 2️⃣ Menu
  if (text.toLowerCase() === "menu") {
    userStates[user] = "BROWSING_MENU";
    await sendList("🍽 AV Food Factory", "Select a dish to add to your cart:");
    return;
  }

  // 3️⃣ Add item
  if (msg.interactive?.list_reply?.id?.startsWith("add_")) {
    const itemId = msg.interactive.list_reply.id.replace("add_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("❌ Item not found.");
    userStates[user] = "ADDING_QTY";
    await sendButtons(`How many *${item.name}* would you like?`, [
      { id: `qty_${item.id}_1`, title: "1" },
      { id: `qty_${item.id}_2`, title: "2" },
      { id: `qty_${item.id}_3`, title: "3" },
    ]);
    return;
  }

  // 4️⃣ Quantity
  if (msg.interactive?.button_reply?.id?.startsWith("qty_")) {
    const [_, itemId, qtyStr] = msg.interactive.button_reply.id.split("_");
    const qty = Number(qtyStr);
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("⚠️ Item not found.");

    const cart = userCarts[user];
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += qty;
    else cart.push({ ...item, qty });

    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    await sendButtons(`✅ Added *${item.name} × ${qty}*.\n\n${summary}\n\nTotal: ₹${total}`, [
      { id: "checkout", title: "Checkout" },
      { id: "menu", title: "Add More" },
      { id: "clear", title: "Clear Cart" },
    ]);
    userStates[user] = "BROWSING_MENU";
    return;
  }

  // 5️⃣ Clear Cart
  if (text.toLowerCase() === "clear" || msg.interactive?.button_reply?.id === "clear") {
    userCarts[user] = [];
    await sendText("🧹 Cart cleared. Type *menu* to start fresh.");
    return;
  }

  // 6️⃣ Checkout
  if (text.toLowerCase() === "checkout" || msg.interactive?.button_reply?.id === "checkout") {
    if (!userCarts[user].length) return sendText("🛒 Cart empty! Type *menu* to order.");
    userStates[user] = "ASK_ADDRESS";
    await sendText("📍 Please type your *delivery address* (street, area, city).");
    return;
  }

  // 7️⃣ Capture address
  if (state === "ASK_ADDRESS" && msg.type === "text") {
    userAddress[user] = text;
    userStates[user] = "ASK_PHONE";
    await sendText("📞 Great! Now please type your *phone number* for delivery.");
    return;
  }

  // 8️⃣ Capture phone
  if (state === "ASK_PHONE" && msg.type === "text") {
    userPhone[user] = text;
    userStates[user] = "CONFIRM";

    const cart = userCarts[user];
    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    await sendButtons(
      `📦 *Confirm your order*\n\n${summary}\n\n💰 Total: ₹${total}\n📍 Address: ${userAddress[user]}\n📞 Phone: ${userPhone[user]}`,
      [
        { id: "confirm_yes", title: "Confirm ✅" },
        { id: "confirm_no", title: "Edit ✏️" },
      ]
    );
    return;
  }

  // 9️⃣ Edit
  if (msg.interactive?.button_reply?.id === "confirm_no") {
    userStates[user] = "ASK_ADDRESS";
    await sendText("✏️ Please re-enter your *delivery address*:");
    return;
  }

  // 🔟 Confirm
  if (msg.interactive?.button_reply?.id === "confirm_yes") {
    const cart = userCarts[user];
    const address = userAddress[user];
    const phone = userPhone[user];
    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    console.log("✅ [ORDER CONFIRMED]", { user, address, phone, total });

    await sendText(`✅ *Order Confirmed!*\n💰 Total: ₹${total}\n📍 ${address}\n📞 ${phone}\nETA: 30–40 mins.\nThank you for ordering with AV Food Factory 🙏`);

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN,
      type: "text",
      text: {
        body: `📢 *New Order Received!*\n👤 User: ${user}\n📞 Phone: ${phone}\n📍 Address: ${address}\n💰 Total: ₹${total}\n\n${summary}`,
      },
    });

    userCarts[user] = [];
    userStates[user] = "IDLE";
    userAddress[user] = "";
    userPhone[user] = "";
    return;
  }

  // 🔁 Default fallback
  await sendButtons("🤖 I didn’t understand. What would you like to do?", [
    { id: "menu", title: "View Menu" },
    { id: "checkout", title: "Checkout" },
    { id: "clear", title: "Clear Cart" },
  ]);
}
