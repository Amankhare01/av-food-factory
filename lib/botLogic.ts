import type { WAMsg, CartItem } from "@/lib/types";
import { sendWhatsAppMessage } from "@/lib/meta";

const ADMIN = process.env.ADMIN_WHATSAPP_NUMBER!;

/** Menu items */
const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
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

// 🛒 In-memory state
let userCarts: Record<string, CartItem[]> = {};
let userStates: Record<string, string> = {};
let userAddress: Record<string, string> = {};

/**
 * Core Bot Logic
 */
export async function handleIncoming(msg: WAMsg) {
  console.log("📩 [NEW MESSAGE]", msg);

  const user = msg.from;
  const text = msg.text?.body?.trim().toLowerCase() || "";

  // Ensure user context
  if (!userCarts[user]) userCarts[user] = [];
  if (!userStates[user]) userStates[user] = "IDLE";

  const state = userStates[user];
  console.log(`👤 User: ${user} | State: ${state} | MsgType: ${msg.type} | Text: "${text}"`);

  /** --- Messaging helpers --- **/
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
      reply: { id: b.id, title: b.title || b.id || "Select" },
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
        body: { text },
        action: { sections: buildMenuList() },
      },
    });
  };

  /** --- Conversation Flow --- **/

  // 1️⃣ Greetings
  if (["hi", "hello", "start"].includes(text)) {
    userStates[user] = "BROWSING_MENU";
    await sendText("👋 Welcome to *AV Food Factory!* 🍱\nType *menu* to browse our delicious dishes.");
    return;
  }

  // 2️⃣ Show Menu
  if (text === "menu") {
    userStates[user] = "BROWSING_MENU";
    await sendList("🍽 AV Food Factory", "Select an item to add to your cart:");
    return;
  }

  // 3️⃣ List reply → Add item
  if (msg.interactive?.list_reply?.id?.startsWith("add_")) {
    const itemId = msg.interactive.list_reply.id.replace("add_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("❌ Item not found.");

    userStates[user] = "ADDING_QTY";
    console.log("➕ [ITEM SELECTED]", item);

    await sendButtons(`How many *${item.name}* would you like to order?`, [
      { id: `qty_${item.id}_1`, title: "1" },
      { id: `qty_${item.id}_2`, title: "2" },
      { id: `qty_${item.id}_3`, title: "3" },
    ]);
    return;
  }

  // 4️⃣ Quantity selected
  if (msg.interactive?.button_reply?.id?.startsWith("qty_")) {
    const [_, itemId, qtyStr] = msg.interactive.button_reply.id.split("_");
    const qty = Number(qtyStr);
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("⚠️ Item not found.");

    const cart = userCarts[user];
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += qty;
    else cart.push({ ...item, qty });

    console.log("🛒 [CART UPDATED]", cart);
    userStates[user] = "BROWSING_MENU";

    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    await sendButtons(`✅ Added *${item.name} × ${qty}*.\n\nYour cart:\n${summary}\n\nSubtotal: ₹${total}`, [
      { id: "checkout", title: "Checkout" },
      { id: "menu", title: "Add More" },
      { id: "clear", title: "Clear Cart" },
    ]);
    return;
  }

  // 5️⃣ Clear Cart
  if (text === "clear" || msg.interactive?.button_reply?.id === "clear") {
    userCarts[user] = [];
    await sendText("🧹 Cart cleared. Type *menu* to start again!");
    return;
  }

  // 6️⃣ Checkout
  if (text === "checkout" || msg.interactive?.button_reply?.id === "checkout") {
    if (!userCarts[user].length) return sendText("🛒 Your cart is empty. Type *menu* to start ordering.");
    userStates[user] = "ASK_ADDRESS";
    await sendText("📍 Please type your *delivery address* now.");
    return;
  }

  // 7️⃣ Address entered
  if (state === "ASK_ADDRESS" && msg.type === "text") {
    const address = msg.text?.body?.trim();
    if (!address) return sendText("❌ Please enter a valid address.");
    userAddress[user] = address;
    userStates[user] = "CONFIRM";

    const cart = userCarts[user];
    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    await sendButtons(`📦 *Confirm your order*\n\n${summary}\n\nTotal: ₹${total}\n📍 Address: ${address}`, [
      { id: "confirm_yes", title: "Confirm ✅" },
      { id: "confirm_no", title: "Edit ✏️" },
    ]);
    return;
  }

  // 8️⃣ Confirm / Edit
  if (msg.interactive?.button_reply?.id === "confirm_no") {
    userStates[user] = "ASK_ADDRESS";
    await sendText("✏️ Please send your corrected address:");
    return;
  }

  if (msg.interactive?.button_reply?.id === "confirm_yes") {
    const cart = userCarts[user];
    const address = userAddress[user];
    const summary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n");
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

    console.log("✅ [ORDER CONFIRMED]", { user, address, total });

    await sendText(`✅ Order Confirmed!\n💰 Total: ₹${total}\nETA: 30–40 mins\nThank you for ordering with AV Food Factory 🙏`);

    // Notify admin
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN,
      type: "text",
      text: {
        body: `📢 *New Order Received!*\n👤 User: ${user}\n💰 Total: ₹${total}\n📍 Address: ${address}\n\n${summary}`,
      },
    });

    // Reset
    userCarts[user] = [];
    userStates[user] = "IDLE";
    userAddress[user] = "";
    return;
  }

  // 9️⃣ Default fallback
  await sendButtons("🤖 I didn’t get that. What would you like to do next?", [
    { id: "menu", title: "View Menu" },
    { id: "checkout", title: "Checkout" },
    { id: "clear", title: "Clear Cart" },
  ]);
}
