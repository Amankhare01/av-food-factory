import { connectDB } from "@/lib/mongodb";
import { Session } from "@/lib/sessionModel";
import { Order } from "@/lib/orderModel";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const MENU = [
  {
    categoryId: "starters",
    title: "Starters",
    items: [
      { id: "s_paneer_tikka", name: "Paneer Tikka", price: 180, img: "https://.../paneer.jpg" },
      { id: "s_chicken_65", name: "Chicken 65", price: 200, img: "https://.../chicken65.jpg" },
    ],
  },
  {
    categoryId: "main",
    title: "Main Course",
    items: [
      { id: "m_butter_chicken", name: "Butter Chicken", price: 250, img: "https://.../butterchicken.jpg" },
      { id: "m_paneer_butter", name: "Paneer Butter Masala", price: 220, img: "https://.../paneerbutter.jpg" },
    ],
  },
  {
    categoryId: "desserts",
    title: "Desserts",
    items: [
      { id: "d_gulab", name: "Gulab Jamun", price: 80, img: "https://.../gulab.jpg" },
      { id: "d_brownie", name: "Brownie with Ice Cream", price: 120, img: "https://.../brownie.jpg" },
    ],
  },
];


export async function handleIncomingMessage(message: any) {
  await connectDB();

  const from = message.from;
  const text = message.text?.body?.trim().toLowerCase();
  const buttonId = message.interactive?.button_reply?.id;
  const listId = message.interactive?.list_reply?.id;
  const action = buttonId || listId || text;

  let session = await Session.findOne({ userId: from });
  if (!session)
    session = await Session.create({ userId: from, cart: [], step: "welcome" });

  console.log(`📩 [${from}] → Action: ${action}`);

  try {
    switch (true) {
      // 🌟 Start / Menu
      case ["hi", "hello", "hey"].includes(action):
        await sendWhatsAppMessage(buildButtons(from, "👋 Welcome to AV Food Factory!"));
        session.step = "welcome";
        break;

      case action === "view_menu":
        await sendWhatsAppMessage(buildCategoryList(from));
        session.step = "choose_category";
        break;

      // 🍴 Category Selection
      case action.startsWith("cat_"):
        await sendWhatsAppMessage(buildItemList(from, action.replace("cat_", "")));
        session.step = "choose_item";
        break;

      // 🧆 Item Selected
      case action.startsWith("item_"): {
        const itemId = action.replace("item_", "");
        await sendWhatsAppMessage(buildItemCard(from, itemId));
        await sendWhatsAppMessage(buildAddToCartButtons(from, itemId));
        session.context = { itemId };
        session.step = "add_to_cart";
        break;
      }

      // ➕ Add Quantity
      case action.startsWith("qty_"): {
        const [_, qty, itemId] = action.split("_");
        const item = MENU.flatMap((c) => c.items).find((i) => i.id === itemId);
        if (!item) {
          await sendWhatsAppMessage(buildText(from, "❌ Item not found."));
          break;
        }
        session.cart.push({
          itemId,
          name: item.name,
          qty: Number(qty),
          price: item.price,
        });
        await sendWhatsAppMessage(buildText(from, `✅ Added *${item.name} ×${qty}* to cart.`));
        await sendWhatsAppMessage(buildButtons(from, "What would you like to do next?"));
        session.step = "menu";
        break;
      }

      // 🛒 View Cart
      case action === "my_cart":
        await sendWhatsAppMessage(buildCartView(from, session));
        break;

      // 🧹 Clear Cart
      case action === "clear_cart":
        session.cart = [];
        await sendWhatsAppMessage(buildText(from, "🧹 Cart cleared."));
        break;

      // ✅ Place Order
      case action === "place_order":
        if (!session.cart?.length)
          await sendWhatsAppMessage(buildText(from, "🛒 Your cart is empty!"));
        else {
          await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
          session.step = "delivery_choice";
        }
        break;

      // 🚚 Delivery / Pickup
      case ["delivery", "pickup"].includes(action):
        session.deliveryType = action;
        await sendWhatsAppMessage(buildShareLocationContact(from, action));
        await sendWhatsAppMessage(buildConfirmOrderButton(from));
        session.step = "confirm_order";
        break;

      // ✅ Confirm Order
          case action === "confirm_order": {
            interface CartItem {
              price: number;
              qty: number;
            }
            const total = session.cart.reduce((sum: number, c: CartItem) => sum + c.price * c.qty, 0);
        await Order.create({
          userId: from,
          cart: session.cart,
          total,
          deliveryType: session.deliveryType,
          status: "Pending",
        });
        await sendWhatsAppMessage(
          buildText(
            from,
            `✅ *Order Confirmed!*\nTotal: ₹${total}\nDelivery Type: ${session.deliveryType.toUpperCase()}\n\nThank you for ordering with *AV Food Factory!* 🍴`
          )
        );
        session.cart = [];
        session.step = "welcome";
        break;
      }

      // ❌ Cancel
      case action === "cancel_order":
        session.cart = [];
        session.step = "welcome";
        await sendWhatsAppMessage(buildText(from, "❌ Order cancelled. Come back soon!"));
        break;

      // 💥 Offers (optional static reply)
      case action === "offers":
        await sendWhatsAppMessage(buildText(from, "🎉 Today’s Offer: Get 10% off on orders above ₹499!"));
        break;

      // 🪄 Fallback
      default:
        await sendWhatsAppMessage(buildButtons(from, "👋 Welcome to AV Food Factory!"));
        break;
    }

    await session.save();
  } catch (err) {
    console.error("❌ Bot Logic Error:", err);
    await sendWhatsAppMessage(buildText(from, "⚠️ Sorry, something went wrong. Please try again."));
  }
}

/* ----------------------------------------------------------
   🧩 MESSAGE BUILDERS
---------------------------------------------------------- */
export function buildText(to: string, bodyText: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: bodyText },
  };
}

export function buildButtons(to: string, bodyText: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: [
          { type: "reply", reply: { id: "view_menu", title: "🍽️ View Menu" } },
          { type: "reply", reply: { id: "my_cart", title: "🛒 My Cart" } },
          { type: "reply", reply: { id: "offers", title: "💥 Offers" } },
        ],
      },
    },
  };
}

export function buildCategoryList(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🍴 AV Food Factory — Menu" },
      body: { text: "Choose a category:" },
      footer: { text: "Tap to view items" },
      action: {
        button: "View Categories",
        sections: MENU.map((cat) => ({
          title: cat.title,
          rows: [
            {
              id: `cat_${cat.categoryId}`,
              title: cat.title,
              description: `${cat.items.length} items`,
            },
          ],
        })),
      },
    },
  };
}

export function buildItemList(to: string, categoryId: string) {
  const cat = MENU.find((m) => m.categoryId === categoryId);
  if (!cat) return buildText(to, "❌ Category not found.");

  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: `🍽️ ${cat.title}` },
      body: { text: "Select an item:" },
      action: {
        button: "View Items",
        sections: [
          {
            title: cat.title,
            rows: cat.items.map((i) => ({
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

export function buildItemCard(to: string, itemId: string) {
  const item = MENU.flatMap((c) => c.items).find((x) => x.id === itemId);
  if (!item) return buildText(to, "❌ Item not found.");

  return {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: {
      link: item.img,
      caption: `*${item.name}* — ₹${item.price}\n\nChoose quantity:`,
    },
  };
}

export function buildAddToCartButtons(to: string, itemId: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Select quantity:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: `qty_1_${itemId}`, title: "1" } },
          { type: "reply", reply: { id: `qty_2_${itemId}`, title: "2" } },
          { type: "reply", reply: { id: `qty_3_${itemId}`, title: "3" } },
        ],
      },
    },
  };
}

export function buildCartView(to: string, session: any) {
  const cart = session.cart || [];
  if (!cart.length) return buildText(to, "🛒 Your cart is empty!");

  const summary = cart
    .map((c: any, i: number) => `${i + 1}. ${c.name} ×${c.qty} — ₹${c.price * c.qty}`)
    .join("\n");

  const total = cart.reduce((sum: number, c: any) => sum + c.price * c.qty, 0);

  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🛒 *Your Cart*\n\n${summary}\n\nSubtotal: ₹${total}` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "place_order", title: "✅ Place Order" } },
          { type: "reply", reply: { id: "clear_cart", title: "🧹 Clear Cart" } },
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

export function buildShareLocationContact(to: string, deliveryType: string) {
  const text =
    deliveryType === "delivery"
      ? "🚚 Please *share your location* (📎 → Location) and *your contact* (📎 → Contact), then tap *Confirm Order*."
      : "🏃 Please *share your contact* (📎 → Contact) so we can confirm pickup details.";
  return buildText(to, text);
}

export function buildConfirmOrderButton(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Ready to confirm order?" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "confirm_order", title: "✅ Confirm Order" } },
          { type: "reply", reply: { id: "cancel_order", title: "❌ Cancel" } },
        ],
      },
    },
  };
}
