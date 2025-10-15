// lib/botLogic.ts
import { Order } from "@/lib/mongodb"; // only for types if needed
import { connectDB } from "@/lib/mongodb";
import { Session } from "@/lib/sessionModel";


// ----- MENU (edit items/prices/images) -----
export const MENU = [
  {
    categoryId: "starters",
    title: "Starters",
    items: [
      {
        id: "s_paneer_tikka",
        name: "Paneer Tikka",
        price: 180,
        img: "https://.../paneer.jpg",
      },
      {
        id: "s_chicken_65",
        name: "Chicken 65",
        price: 200,
        img: "https://.../chicken65.jpg",
      },
    ],
  },
  {
    categoryId: "main",
    title: "Main Course",
    items: [
      {
        id: "m_butter_chicken",
        name: "Butter Chicken",
        price: 250,
        img: "https://.../butterchicken.jpg",
      },
      {
        id: "m_paneer_butter",
        name: "Paneer Butter Masala",
        price: 220,
        img: "https://.../paneerbutter.jpg",
      },
    ],
  },
  {
    categoryId: "desserts",
    title: "Desserts",
    items: [
      {
        id: "d_gulab",
        name: "Gulab Jamun",
        price: 80,
        img: "https://.../gulab.jpg",
      },
      {
        id: "d_brownie",
        name: "Brownie with Ice Cream",
        price: 120,
        img: "https://.../brownie.jpg",
      },
    ],
  },
];

// ----- Simple session store (serverless, in-memory) -----
// WARNING: In-memory sessions are ephemeral (restarts will lose carts).
// For production use a persistent store (Redis, Dynamo, Firestore).
export const sessions: Record<string, any> = {};

// Helper: get or create session by sender phone
export async function getSession(sender: string) {
  await connectDB();

  let session = await Session.findOne({ userPhone: sender });
  if (!session) {
    session = await Session.create({
      userPhone: sender,
      cart: [],
      pendingAction: null,
      deliveryType: null,
      tempOrderMeta: {},
    });
  }
  return session;
}


// Build a button interactive message (reply buttons)
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
          // {
          //   type: "reply",
          //   reply: { id: "place_order", title: "✅ Place Order" },
          // },
        ],
      },
    },
  };
}

// Build a list of categories
export function buildCategoryList(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🍴 AV Food Factory — Categories" },
      body: { text: "Choose a category" },
      footer: { text: "Tap a category to view items" },
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

// Build list of items for a category
export function buildItemList(to: string, categoryId: string) {
  const cat = MENU.find((m) => m.categoryId === categoryId);
  if (!cat) return null;
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: `🍽️ ${cat.title}` },
      body: { text: `Choose item to view / add` },
      footer: { text: "Tap an item" },
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

// Build item card (text + buttons add/back)
export function buildItemCard(to: string, itemId: string) {
  const flat = MENU.flatMap((c) => c.items);
  const it = flat.find((x) => x.id === itemId);
  if (!it) return null;
  return {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: {
      link: it.img,
      caption: `*${it.name}* — ₹${it.price}\n\nChoose an action:`,
    },
    // We will follow with a buttons interactive message (text + "Add to Cart")
  };
}

// Build Add-to-cart buttons
export function buildAddToCartButtons(to: string, itemId: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Choose quantity to add:" },
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

// Build view cart text (summary + checkout buttons)
export function buildCartView(to: string, session: any) {
  const cart = session.cart || [];
  if (cart.length === 0) {
    return {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: "🛒 Your cart is empty. Tap *View Menu* to add items." },
    };
  }
  const lines = cart
    .map(
      (c: any, idx: number) =>
        `${idx + 1}. ${c.name} x${c.qty} — ₹${c.price * c.qty}`
    )
    .join("\n");
  const subtotal = cart.reduce((s: number, c: any) => s + c.price * c.qty, 0);
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🛒 Your Cart\n\n${lines}\n\nSubtotal: ₹${subtotal}` },
      action: {
        buttons: [
          {
            type: "reply",
            reply: { id: "place_order", title: "✅ Place Order" },
          },
          {
            type: "reply",
            reply: { id: "clear_cart", title: "🧹 Clear Cart" },
          },
        ],
      },
    },
  };
}

// Ask delivery or pickup
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

// Ask user to share location & contact
export function buildShareLocationContact(
  to: string,
  deliveryType: "delivery" | "pickup"
) {
  if (deliveryType === "delivery") {
    return {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: "🚚 To get your order delivered, please *share your location* (tap attachment → Location) and *share your contact* (tap attachment → Contact). \n\nAfter sharing both, tap *Confirm Order*.",
      },
    };
  }
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: "🏃 For pickup, please *share your contact* (tap attachment → Contact) so we can confirm pickup details.",
    },
  };
}

// Build final confirm order button
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
          {
            type: "reply",
            reply: { id: "confirm_order", title: "✅ Confirm Order" },
          },
          { type: "reply", reply: { id: "cancel_order", title: "❌ Cancel" } },
        ],
      },
    },
  };
}
