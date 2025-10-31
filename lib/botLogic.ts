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

/** Pure function for logging + responding */
export async function handleIncoming(msg: WAMsg) {
  console.log("📩 [NEW MESSAGE]", msg);

  const user = msg.from;
  const text = msg.text?.body?.trim().toLowerCase() || "";

  if (!userCarts[user]) userCarts[user] = [];
  if (!userStates[user]) userStates[user] = "IDLE";

  const state = userStates[user];
  console.log(`👤 User: ${user} | State: ${state} | MsgType: ${msg.type} | Text: "${text}"`);

  /** Helper to send messages */
  const sendText = async (body: string) =>
    sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "text",
      text: { body },
    });

  const sendButtons = async (body: string, buttons: { id: string; title: string }[]) =>
    sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: user,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: { buttons: buttons.map((b) => ({ type: "reply", reply: b })) },
      },
    });

  const sendList = async (header: string, body: string) =>
    sendWhatsAppMessage({
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

  // 🧠 State machine logic
  if (["hi", "hello", "start"].includes(text)) {
    userStates[user] = "BROWSING_MENU";
    await sendText("👋 Welcome to *AV Food Factory!* 🍱\nType *menu* to browse delicious dishes.");
    return;
  }

  if (text === "menu") {
    userStates[user] = "BROWSING_MENU";
    await sendList("🍽 AV Food Factory", "Select an item to add to your cart:");
    return;
  }

  if (msg.interactive?.list_reply?.id?.startsWith("add_")) {
    const itemId = msg.interactive.list_reply.id.replace("add_", "");
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("❌ Item not found.");
    userStates[user] = "ADDING_QTY";
    userAddress[user] = "";
    console.log("➕ [ITEM SELECTED]", item);
    await sendButtons(`How many *${item.name}* would you like to order?`, [
      { id: `qty_${item.id}_1`, title: "1" },
      { id: `qty_${item.id}_2`, title: "2" },
      { id: `qty_${item.id}_3`, title: "3" },
    ]);
    return;
  }

  if (msg.interactive?.button_reply?.id?.startsWith("qty_")) {
    const parts = msg.interactive.button_reply.id.split("_");
    const itemId = parts[1];
    const qty = Number(parts[2]);
    const item = MENU.find((i) => i.id === itemId);
    if (!item) return sendText("⚠️ Item not found.");

    const cart = userCarts[user];
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += qty;
    else cart.push({ ...item, qty });

    console.log("🛒 [CART UPDATED]", cart);
    userStates[user] = "BROWSING_MENU";

    await sendButtons(
      `✅ Added *${item.name} × ${qty}* to cart.\n\nYour cart:\n${cart.map(
        (c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`
      ).join("\n")}\n\nSubtotal: ₹${cart.reduce((s, c) => s + c.qty * c.price, 0)}`,
      [
        { id: "checkout", title: "Checkout" },
        { id: "menu", title: "Add More" },
        { id: "clear", title: "Clear Cart" },
      ]
    );
    return;
  }

  if (text === "clear") {
    userCarts[user] = [];
    await sendText("🧹 Cart cleared. Type *menu* to start fresh!");
    return;
  }

  if (text === "checkout" || msg.interactive?.button_reply?.id === "checkout") {
    if (!userCarts[user].length) return sendText("🛒 Cart empty! Type *menu* to order.");
    userStates[user] = "ASK_ADDRESS";
    await sendText("📍 Please type your *delivery address* now.");
    return;
  }

  if (state === "ASK_ADDRESS" && msg.type === "text") {
    const address = msg.text?.body?.trim();
    userAddress[user] = address || "";
    userStates[user] = "CONFIRM";
    console.log("🏠 [ADDRESS CAPTURED]", address);

    const cart = userCarts[user];
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
    const orderSummary = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`).join("\n");

    await sendButtons(
      `📦 *Confirm Order*\n\n${orderSummary}\n\nTotal: ₹${total}\n📍 Address:\n${address}`,
      [
        { id: "confirm_yes", title: "Confirm ✅" },
        { id: "confirm_no", title: "Edit ✏️" },
      ]
    );
    return;
  }

  if (msg.interactive?.button_reply?.id === "confirm_no") {
    userStates[user] = "ASK_ADDRESS";
    await sendText("✏️ Please send your corrected address:");
    return;
  }

  if (msg.interactive?.button_reply?.id === "confirm_yes") {
    const cart = userCarts[user];
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
    const orderText = cart.map((c) => `• ${c.name} × ${c.qty} = ₹${c.qty * c.price}`).join("\n");
    const address = userAddress[user] || "Not provided";

    console.log("✅ [ORDER CONFIRMED]", { user, cart, total, address });
    userStates[user] = "DONE";

    await sendText(`✅ Order Confirmed!\nTotal: ₹${total}\nETA: 30–40 mins\nThank you for ordering with AV Food Factory 🙏`);

    // Notify admin
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: ADMIN,
      type: "text",
      text: {
        body: `📢 *New Order Received!*\n👤 User: ${user}\n💰 Total: ₹${total}\n📍 Address: ${address}\n\n${orderText}`,
      },
    });

    // Reset user state
    userCarts[user] = [];
    userStates[user] = "IDLE";
    return;
  }

  // Default fallback
  await sendButtons("🤖 I didn’t get that. What would you like to do?", [
    { id: "menu", title: "View Menu" },
    { id: "checkout", title: "Checkout" },
    { id: "clear", title: "Clear Cart" },
  ]);
}
