import { Session } from "@/models/Session";
import { Order } from "@/models/Order";
import { sendText, sendButtons, sendList, notifyAdmin } from "@/lib/meta";
import type { WAMsg, SessionState, CartItem } from "@/lib/types";

export const MENU = [
  { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
  { id: "butter_chicken", name: "Butter Chicken", price: 250 },
  { id: "veg_biryani", name: "Veg Biryani", price: 160 },
  { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
];

function menuSections() {
  return [
    {
      title: "Popular",
      rows: MENU.map((i) => ({
        id: `add_${i.id}`,
        title: `${i.name} — ₹${i.price}`,
        description: "Tap to add",
      })),
    },
  ];
}

function calcSubtotal(cart: CartItem[]) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart(cart: CartItem[]) {
  if (!cart.length) return "🛒 Cart is empty.";
  return (
    cart.map((i) => `• ${i.name} x ${i.qty} — ₹${i.price * i.qty}`).join("\n") +
    `\n\nSubtotal: ₹${calcSubtotal(cart)}`
  );
}

function findMenuItem(id: string) {
  return MENU.find((m) => m.id === id);
}

// ⚙️ Main bot logic handler with detailed logging
export async function handleIncoming(msg: WAMsg) {
  console.log("📥 [INCOMING]", {
    from: msg.from,
    type: msg.type,
    text: msg.text?.body,
    interactive: msg.interactive?.button_reply || msg.interactive?.list_reply,
  });

  const user = msg.from;
  let session = await Session.findOne({ user });

  if (!session) {
    session = await Session.create({ user, state: "IDLE", cart: [] });
    console.log("🆕 [SESSION CREATED]", user);
  } else {
    console.log("📄 [SESSION FOUND]", { user, state: session.state });
  }

  const text = msg.text?.body?.trim().toLowerCase() || "";
  await Session.updateOne({ _id: session._id }, { lastMessageAt: new Date() });

  // GLOBAL COMMANDS
  if (["menu", "order", "start", "hi", "hello", "hey"].includes(text)) {
    console.log("🔁 [GLOBAL COMMAND] Menu flow triggered by", user);
    await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU", tempItemId: null });
    await sendList(user, "AV Food Factory", "Browse & add items to cart:", menuSections());
    return;
  }

  if (["cart", "view cart"].includes(text)) {
    console.log("🛒 [CART VIEW] User requested cart:", user);
    await sendButtons(user, renderCart(session.cart), [
      { id: "btn_checkout", title: "Checkout" },
      { id: "btn_browse", title: "Add more" },
      { id: "btn_clear", title: "Clear cart" },
    ]);
    return;
  }

  if (["clear", "clear cart"].includes(text)) {
    console.log("🧹 [CART CLEARED]", user);
    await Session.updateOne({ _id: session._id }, { cart: [] });
    await sendText(user, "🧹 Cart cleared. Type *menu* to add items.");
    return;
  }

  // Handle message types
  switch (msg.type) {
    case "interactive": {
      const choice = msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id || "";
      console.log("🎛 [INTERACTIVE INPUT]", { user, choice });

      // BUTTONS
      switch (choice) {
        case "btn_browse":
          console.log("🧾 User chose to browse more items");
          await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU" });
          await sendList(user, "AV Food Factory", "Browse & add items to cart:", menuSections());
          return;

        case "btn_clear":
          console.log("🧹 User cleared cart");
          await Session.updateOne({ _id: session._id }, { cart: [] });
          await sendText(user, "🧹 Cart cleared. Type *menu* to add items.");
          return;

        case "btn_checkout":
          console.log("💳 User proceeded to checkout");
          if (!session.cart.length) {
            await sendText(user, "Your cart is empty. Type *menu* to add items.");
            return;
          }
          await Session.updateOne({ _id: session._id }, { state: "ASK_ADDRESS" });
          await sendText(user, "📍 Please share your *delivery address* in one message.");
          return;
      }

      // LIST SELECTIONS
      if (choice.startsWith("add_")) {
        const itemId = choice.replace("add_", "");
        const item = findMenuItem(itemId);
        console.log("➕ [ADD ITEM]", { user, itemId });
        if (!item) {
          await sendText(user, "Item not found. Type *menu* to try again.");
          return;
        }
        await Session.updateOne(
          { _id: session._id },
          { state: "ADDING_ITEM_QTY", tempItemId: item.id }
        );
        await sendButtons(user, `How many *${item.name}*?`, [
          { id: "qty_1", title: "1" },
          { id: "qty_2", title: "2" },
          { id: "qty_3", title: "3" },
        ]);
        return;
      }

      // QUANTITY BUTTONS
      if (choice.startsWith("qty_")) {
        const qty = Number(choice.replace("qty_", ""));
        console.log("🍽 [QUANTITY CHOSEN]", { user, qty });
        if (session.state !== "ADDING_ITEM_QTY" || !session.tempItemId) {
          await sendText(user, "No item selected. Type *menu* to add items.");
          return;
        }
        const item = findMenuItem(session.tempItemId);
        if (!item || qty <= 0) {
          await sendText(user, "Invalid quantity.");
          return;
        }

        const existing = session.cart.find((c: any) => c.id === item.id);
        if (existing) existing.qty += qty;
        else session.cart.push({ id: item.id, name: item.name, price: item.price, qty });
        await session.save();

        console.log("🛍 [CART UPDATED]", session.cart);

        await sendButtons(
          user,
          `${renderCart(session.cart)}\n\nAdd more or checkout?`,
          [
            { id: "btn_browse", title: "Add more" },
            { id: "btn_checkout", title: "Checkout" },
            { id: "btn_clear", title: "Clear cart" },
          ]
        );
        await Session.updateOne(
          { _id: session._id },
          { state: "BROWSING_MENU", tempItemId: null }
        );
        return;
      }

      // CONFIRMATION
      if (choice === "confirm_yes") {
        console.log("✅ [ORDER CONFIRMATION]", user);
        const subtotal = calcSubtotal(session.cart);
        const order = await Order.create({
          user,
          items: session.cart,
          subtotal,
          deliveryAddress: session.deliveryAddress,
        });
        console.log("🧾 [ORDER CREATED]", { id: order._id, subtotal });
        await sendText(
          user,
          `✅ Order placed!\nOrder ID: ${order._id}\nTotal: ₹${subtotal}\nETA: ~35–45 min.\n\nThank you!`
        );
        await notifyAdmin(
          `📦 New Order\nUser: ${user}\nTotal: ₹${subtotal}\nAddress: ${session.deliveryAddress}\nItems:\n${session.cart
            .map((i: any) => `• ${i.name} x ${i.qty} = ₹${i.qty * i.price}`)
            .join("\n")}`
        );
        await Session.updateOne(
          { _id: session._id },
          { state: "DONE", cart: [], deliveryAddress: null, tempItemId: null }
        );
        return;
      }

      if (choice === "confirm_no") {
        console.log("✏️ [USER EDITING ADDRESS]");
        await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU" });
        await sendList(user, "AV Food Factory", "No problem. Continue browsing:", menuSections());
        return;
      }

      console.log("❓ [UNKNOWN INTERACTIVE CHOICE]", choice);
      await sendText(user, "I didn't get that. Type *menu* to browse.");
      return;
    }

    case "location": {
      console.log("📍 [LOCATION RECEIVED]", msg.location);
      if (session.state === "ASK_ADDRESS") {
        const { latitude, longitude, address } = msg.location!;
        const addr = address
          ? `${address}\n(${latitude}, ${longitude})`
          : `Pin: ${latitude}, ${longitude}`;
        await Session.updateOne(
          { _id: session._id },
          { deliveryAddress: addr, state: "CONFIRMING_ORDER" }
        );
        await sendButtons(
          user,
          `📍 Address:\n${addr}\n\n${renderCart(session.cart)}\n\nConfirm order?`,
          [
            { id: "confirm_yes", title: "Confirm" },
            { id: "confirm_no", title: "Edit" },
          ]
        );
        return;
      }
      await sendText(user, "Thanks for the location. Type *menu* to order.");
      return;
    }

    case "text": {
      console.log("💬 [TEXT RECEIVED]", { text, state: session.state });
      switch (session.state as SessionState) {
        case "ASK_ADDRESS": {
          const addr = msg.text?.body?.trim();
          if (!addr) {
            await sendText(user, "Please type your address in one message.");
            return;
          }
          console.log("🏠 [ADDRESS RECEIVED]", addr);
          await Session.updateOne(
            { _id: session._id },
            { deliveryAddress: addr, state: "CONFIRMING_ORDER" }
          );
          await sendButtons(
            user,
            `📍 Address:\n${addr}\n\n${renderCart(session.cart)}\n\nConfirm order?`,
            [
              { id: "confirm_yes", title: "Confirm" },
              { id: "confirm_no", title: "Edit" },
            ]
          );
          return;
        }

        default:
          if (text.includes("menu")) {
            console.log("📋 [REDIRECT TO MENU]");
            await Session.updateOne({ _id: session._id }, { state: "BROWSING_MENU" });
            await sendList(user, "AV Food Factory", "Browse & add items to cart:", menuSections());
            return;
          }
          console.log("🤖 [FALLBACK PROMPT]");
          await sendButtons(user, "What would you like to do?", [
            { id: "btn_browse", title: "View Menu" },
            { id: "btn_checkout", title: "Checkout" },
            { id: "btn_clear", title: "Clear Cart" },
          ]);
          return;
      }
    }

    default:
      console.log("❌ [UNSUPPORTED MESSAGE TYPE]", msg.type);
      await sendText(user, "Unsupported message type. Please send text or use the buttons.");
      return;
  }
}
