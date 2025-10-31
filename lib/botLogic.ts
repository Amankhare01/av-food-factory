import type { WAMsg, CartItem } from "@/lib/types";
import { sendWhatsAppMessage } from "@/lib/meta";

const ADMIN = process.env.ADMIN_WHATSAPP_NUMBER!;

/** 🍽 MENU DATA **/
const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "veg_biryani", name: "Veg Biryani", price: 160 },
  { id: "dal_makhani", name: "Dal Makhani", price: 140 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
];

const buildMenuList = () => [
  {
    title: "Main Course 🍛",
    rows: MENU.map((i) => ({
      id: `add_${i.id}`,
      title: `${i.name} — ₹${i.price}`,
      description: "Tap to add",
    })),
  },
];

// 🧠 In-memory state
let userCarts: Record<string, CartItem[]> = {};
let userStates: Record<string, string> = {};
let userAddress: Record<string, string> = {};
let userPhone: Record<string, string> = {};

/** 🔧 Helpers */
const calcTotal = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + i.price * i.qty, 0);
const renderCart = (cart: CartItem[]) =>
  cart.length
    ? cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n")
    : "🛒 Your cart is empty.";

/** 🧩 BOT LOGIC **/
export async function handleIncoming(msg: WAMsg) {
  const user = msg.from;
  const text = msg.text?.body?.trim().toLowerCase() || "";
  console.log("\n📩 [NEW MESSAGE]", { user, text, type: msg.type });

  // Ensure user context
  if (!userCarts[user]) userCarts[user] = [];
  if (!userStates[user]) userStates[user] = "IDLE";

  const state = userStates[user];
  console.log(`👤 State: ${state}`);

  // --- Helper Senders ---
  const sendText = async (body: string) => {
    console.log("💬 [SEND TEXT]", body);
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "text",
      text: { body },
    });
  };

  const sendButtons = async (
    body: string,
    buttons: { id: string; title: string }[]
  ) => {
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
    console.log("📜 [SEND LIST]");
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

  // --- Flow Starts ---

  // 1️⃣ GREETING
  if (["hi", "hello", "hey", "start"].includes(text)) {
    userStates[user] = "WELCOME";
    await sendButtons(
      "👋 Welcome to *AV Food Factory!* 🍱\nHow can I help you today?",
      [{ id: "menu", title: "View Menu 🍽️" }]
    );
    return;
  }

  // 2️⃣ SHOW MENU (typed or button)
  if (
    text === "menu" ||
    msg.interactive?.button_reply?.id === "menu"
  ) {
    userStates[user] = "BROWSING_MENU";
    await sendList("🍽 AV Food Factory Menu", "Select an item to add to your cart:");
    return;
  }

  // 3️⃣ ITEM SELECTED
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

  // 4️⃣ QUANTITY CHOSEN
  if (msg.interactive?.button_reply?.id?.startsWith("qty_")) {
    const [_, itemId, qtyStr] = msg.interactive.button_reply.id.split("_");
    const qty = Number(qtyStr);
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("⚠️ Item not found.");
    const cart = userCarts[user];
    const existing = cart.find((c) => c.id === item.id);
    existing ? (existing.qty += qty) : cart.push({ ...item, qty });
    console.log("🛒 [CART UPDATED]", cart);

    const total = calcTotal(cart);
    const cartText = renderCart(cart);
    await sendButtons(`✅ Added *${item.name} × ${qty}*.\n\n${cartText}\n\nSubtotal: ₹${total}`, [
      { id: "checkout", title: "Checkout 💳" },
      { id: "menu", title: "Add More 🍛" },
      { id: "clear", title: "Clear Cart 🧹" },
    ]);
    userStates[user] = "BROWSING_MENU";
    return;
  }

  // 5️⃣ CLEAR CART
  if (text === "clear" || msg.interactive?.button_reply?.id === "clear") {
    userCarts[user] = [];
    await sendText("🧹 Cart cleared. Type *menu* to start again.");
    return;
  }

  // 6️⃣ CHECKOUT
  if (text === "checkout" || msg.interactive?.button_reply?.id === "checkout") {
    const cart = userCarts[user];
    if (!cart.length) return sendText("🛒 Your cart is empty! Type *menu* to start ordering.");
    userStates[user] = "ASK_ADDRESS";
    await sendText("📍 Please type your *delivery address* (Street, Area, City):");
    return;
  }

  // 7️⃣ ADDRESS INPUT
  if (state === "ASK_ADDRESS" && msg.type === "text") {
    userAddress[user] = msg.text?.body?.trim() || "";
    if (!userAddress[user]) return sendText("⚠️ Please enter a valid address.");
    userStates[user] = "ASK_PHONE";
    await sendText("📞 Great! Now please enter your *phone number* for delivery:");
    return;
  }

  // 8️⃣ PHONE INPUT
  if (state === "ASK_PHONE" && msg.type === "text") {
    const phone = msg.text?.body?.trim() || "";
    if (!/^[0-9]{10,}$/.test(phone))
      return sendText("❌ Please enter a valid 10-digit phone number.");
    userPhone[user] = phone;
    userStates[user] = "CONFIRM";
    const cart = userCarts[user];
    const total = calcTotal(cart);
    const cartText = renderCart(cart);
    await sendButtons(
      `📦 *Confirm your order*\n\n${cartText}\n💰 Total: ₹${total}\n📍 Address: ${userAddress[user]}\n📞 Phone: ${userPhone[user]}`,
      [
        { id: "confirm_yes", title: "Confirm ✅" },
        { id: "confirm_no", title: "Edit ✏️" },
      ]
    );
    return;
  }

  // 9️⃣ EDIT ADDRESS
  if (msg.interactive?.button_reply?.id === "confirm_no") {
    userStates[user] = "ASK_ADDRESS";
    await sendText("✏️ Please re-enter your *delivery address*:");
    return;
  }

  // 🔟 CONFIRM ORDER
  if (msg.interactive?.button_reply?.id === "confirm_yes") {
    const cart = userCarts[user];
    const total = calcTotal(cart);
    const cartText = renderCart(cart);
    const address = userAddress[user];
    const phone = userPhone[user];

    await sendText(`✅ *Order Confirmed!*\n💰 Total: ₹${total}\n📍 ${address}\n📞 ${phone}\nETA: 30–40 mins\n🙏 Thank you for ordering with AV Food Factory!`);

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN,
      type: "text",
      text: {
        body: `📢 *New Order Received!*\n👤 User: ${user}\n📞 ${phone}\n📍 ${address}\n💰 ₹${total}\n\n${cartText}`,
      },
    });

    console.log("✅ [ORDER SENT TO ADMIN]");
    userStates[user] = "IDLE";
    userCarts[user] = [];
    userAddress[user] = "";
    userPhone[user] = "";
    return;
  }

  // 🔁 FALLBACK
  await sendButtons("🤖 I didn’t get that. What would you like to do?", [
    { id: "menu", title: "View Menu 🍽️" },
    { id: "checkout", title: "Checkout 💳" },
    { id: "clear", title: "Clear Cart 🧹" },
  ]);
}
