import { Session } from "@/models/Session";
import { Order } from "@/models/Order";
import type { WAMsg, CartItem, SessionState } from "@/lib/types";

/** Menu Items */
export const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "veg_biryani", name: "Veg Biryani", price: 160 },
  { id: "dal_makhani", name: "Dal Makhani", price: 140 },
  { id: "roti", name: "Tandoori Roti", price: 20 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
  { id: "cold_drink", name: "Cold Drink", price: 50 },
];

const buildMenuList = () => [
  {
    title: "Popular Items 🍽",
    rows: MENU.map((i) => ({
      id: `add_${i.id}`,
      title: `${i.name} — ₹${i.price}`,
      description: "Tap to add",
    })),
  },
];

/** Helper functions */
const calcTotal = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + i.price * i.qty, 0);

const renderCart = (cart: CartItem[]) =>
  cart.length
    ? cart.map((i) => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join("\n")
    : "🛒 Your cart is empty.";

/**
 * handleIncoming() — pure logic.
 * Receives a WhatsApp message → returns an array of reply payloads
 */
export async function handleIncoming(msg: WAMsg) {
  const replies: any[] = [];
  const user = msg.from;
  const text = msg.text?.body?.trim().toLowerCase() || "";

  console.log("📥 handleIncoming()", { user, type: msg.type, text });

  // 🧩 Fetch or create session
  let session = await Session.findOne({ user });
  if (!session) {
    session = await Session.create({ user, state: "IDLE", cart: [] });
    console.log("🆕 Session created for", user);
  }

  // Update activity timestamp
  await Session.updateOne({ _id: session._id }, { lastMessageAt: new Date() });

  // 🧠 ROUTING by state and message
  const sendText = (body: string) =>
    replies.push({ messaging_product: "whatsapp", to: user, type: "text", text: { body } });

  const sendButtons = (body: string, buttons: { id: string; title: string }[]) =>
    replies.push({
      messaging_product: "whatsapp",
      to: user,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: { buttons: buttons.map((b) => ({ type: "reply", reply: b })) },
      },
    });

  const sendList = (header: string, body: string) =>
    replies.push({
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

  // 🏁 ENTRY POINT
  if (["hi", "hello", "hey", "start"].includes(text)) {
    await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU" });
    sendText("👋 Welcome to *AV Food Factory!* 🍱\n\nYou can browse our menu or view your cart anytime.\n\nType *menu* to start ordering.");
    return replies;
  }

  if (text === "menu") {
    await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU" });
    sendList("🍽 AV Food Factory", "Select an item to add to your cart:");
    return replies;
  }

  if (text === "cart") {
    const cartText = renderCart(session.cart);
    sendButtons(`${cartText}\n\nSubtotal: ₹${calcTotal(session.cart)}`, [
      { id: "btn_checkout", title: "Checkout" },
      { id: "btn_browse", title: "Add More" },
      { id: "btn_clear", title: "Clear Cart" },
    ]);
    return replies;
  }

  if (text === "clear") {
    await Session.updateOne({ _id: session._id }, { cart: [] });
    sendText("🧹 Your cart has been cleared. Type *menu* to start fresh.");
    return replies;
  }

  // 🧩 INTERACTIVE MESSAGE HANDLING
  if (msg.interactive) {
    const choice =
      msg.interactive.button_reply?.id || msg.interactive.list_reply?.id || "";
    console.log("🎛 Interactive choice:", choice);

    // LIST SELECT → add item
    if (choice.startsWith("add_")) {
      const itemId = choice.replace("add_", "");
      const item = MENU.find((m) => m.id === itemId);
      if (!item) {
        sendText("❌ That item isn’t available right now. Please try again.");
        return replies;
      }
      await Session.updateOne({ _id: session._id }, { state: "ADDING_ITEM_QTY", tempItemId: item.id });
      sendButtons(`How many *${item.name}* would you like to order?`, [
        { id: "qty_1", title: "1" },
        { id: "qty_2", title: "2" },
        { id: "qty_3", title: "3" },
      ]);
      return replies;
    }

    // QUANTITY CHOICE
    if (choice.startsWith("qty_")) {
      const qty = Number(choice.replace("qty_", ""));
      const item = MENU.find((m) => m.id === session.tempItemId);
      if (!item) {
        sendText("Item not found. Type *menu* to start over.");
        return replies;
      }

      const existing = session.cart.find((c: any) => c.id === item.id);
      if (existing) existing.qty += qty;
      else session.cart.push({ id: item.id, name: item.name, price: item.price, qty });
      await session.save();

      console.log("🛍 Cart updated:", session.cart);

      sendButtons(`🛒 Added *${item.name} × ${qty}*.\n\n${renderCart(session.cart)}\n\nSubtotal: ₹${calcTotal(session.cart)}.`, [
        { id: "btn_browse", title: "Add More" },
        { id: "btn_checkout", title: "Checkout" },
        { id: "btn_clear", title: "Clear Cart" },
      ]);
      await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU", tempItemId: null });
      return replies;
    }

    // BUTTONS → checkout flow
    if (choice === "btn_checkout") {
      if (!session.cart.length) {
        sendText("🛒 Your cart is empty. Type *menu* to add items.");
        return replies;
      }
      await Session.updateOne({ _id: session._id }, { state: "ASK_ADDRESS" });
      sendText("📍 Please send your *delivery address* now.");
      return replies;
    }

    if (choice === "btn_browse") {
      sendList("🍽 AV Food Factory", "Select another item to add to your cart:");
      return replies;
    }

    if (choice === "btn_clear") {
      await Session.updateOne({ _id: session._id }, { cart: [] });
      sendText("🧹 Cart cleared. Type *menu* to start over.");
      return replies;
    }

    if (choice === "confirm_yes") {
      const subtotal = calcTotal(session.cart);
      const order = await Order.create({
        user,
        items: session.cart,
        subtotal,
        deliveryAddress: session.deliveryAddress,
      });
      sendText(`✅ Order Confirmed!\n\nOrder ID: ${order._id}\nTotal: ₹${subtotal}\nEstimated Delivery: 30–40 min.\n\nThank you for ordering with AV Food Factory! 🙏`);
      await Session.updateOne({ _id: session._id }, { cart: [], deliveryAddress: null, state: "DONE" });
      // Admin notification payload (you can send this manually)
      replies.push({
        messaging_product: "whatsapp",
        to: process.env.ADMIN_WHATSAPP_NUMBER!,
        type: "text",
        text: {
          body: `📦 *New Order Alert!*\nUser: ${user}\nTotal: ₹${subtotal}\nAddress: ${session.deliveryAddress}\n\n${renderCart(session.cart)}`,
        },
      });
      return replies;
    }

    if (choice === "confirm_no") {
      await Session.updateOne({ _id: session._id }, { state: "ASK_ADDRESS" });
      sendText("✏️ Please send your updated address:");
      return replies;
    }
  }

  // 🧭 ADDRESS CAPTURE (text or location)
  if (msg.type === "location" && session.state === "ASK_ADDRESS") {
    const loc = msg.location!;
    const addr = loc.address
      ? `${loc.address}\n(${loc.latitude}, ${loc.longitude})`
      : `Location: ${loc.latitude}, ${loc.longitude}`;
    await Session.updateOne({ _id: session._id }, { deliveryAddress: addr, state: "CONFIRMING_ORDER" });
    sendButtons(`📍 Address:\n${addr}\n\n${renderCart(session.cart)}\n\nConfirm order?`, [
      { id: "confirm_yes", title: "Confirm" },
      { id: "confirm_no", title: "Edit" },
    ]);
    return replies;
  }

  if (msg.type === "text" && session.state === "ASK_ADDRESS") {
    const addr = msg.text?.body?.trim();
    if (!addr) {
      sendText("❌ Please type your address clearly.");
      return replies;
    }
    await Session.updateOne({ _id: session._id }, { deliveryAddress: addr, state: "CONFIRMING_ORDER" });
    sendButtons(`📍 Address:\n${addr}\n\n${renderCart(session.cart)}\n\nConfirm order?`, [
      { id: "confirm_yes", title: "Confirm" },
      { id: "confirm_no", title: "Edit" },
    ]);
    return replies;
  }

  // 🔚 Default fallback
  sendButtons("🤖 I didn’t quite catch that. What would you like to do next?", [
    { id: "btn_browse", title: "View Menu" },
    { id: "btn_checkout", title: "Checkout" },
    { id: "btn_clear", title: "Clear Cart" },
  ]);
  return replies;
}
