// lib/botLogic.ts
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

// ---- Simple in-memory session ----
type Step =
  | "INIT"
  | "AWAITING_CATEGORY"
  | "AWAITING_MENU"
  | "AWAITING_QTY"
  | "AWAITING_DELIVERY"
  | "AWAITING_PHONE"
  | "AWAITING_ADDRESS"
  | "AWAITING_CONFIRM";

type OrderDraft = {
  categoryId?: string;
  categoryName?: string;
  itemId?: string;
  itemName?: string;
  qty?: number;
  delivery?: "pickup" | "delivery";
  phone?: string;
  address?: string;
};

const userStates = new Map<string, { step: Step; order: OrderDraft }>();

// ---- Menu Collections ----
const CATEGORIES = [
  { id: "breakfast", name: "Breakfast" },
  { id: "snacks", name: "Snacks" },
  { id: "lunch", name: "Lunch" },
  { id: "biryani", name: "Biryani" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
  { id: "combos", name: "Combos" },
];

// ---- Items per Category ----
const MENU: Record<string, { id: string; name: string; price: number }[]> = {
  breakfast: [
    { id: "paratha_combo", name: "Paratha Combo", price: 120 },
    { id: "poha", name: "Poha", price: 70 },
    { id: "idli_sambar", name: "Idli Sambar", price: 90 },
    { id: "upma", name: "Upma", price: 80 },
    { id: "masala_dosa", name: "Masala Dosa", price: 100 },
  ],
  snacks: [
    { id: "samosa", name: "Samosa", price: 30 },
    { id: "paneer_pakoda", name: "Paneer Pakoda", price: 60 },
    { id: "veg_cutlet", name: "Veg Cutlet", price: 50 },
    { id: "chowmein", name: "Veg Chowmein", price: 120 },
    { id: "pasta", name: "Cheese Pasta", price: 150 },
  ],
  lunch: [
    { id: "thali_veg", name: "Veg Thali", price: 180 },
    { id: "thali_nonveg", name: "Non-Veg Thali", price: 220 },
    { id: "paneer_tikka", name: "Paneer Tikka", price: 180 },
    { id: "dal_makhani", name: "Dal Makhani", price: 150 },
    { id: "naan_combo", name: "Butter Naan Combo", price: 160 },
  ],
  biryani: [
    { id: "veg_biryani", name: "Veg Biryani", price: 160 },
    { id: "chicken_biryani", name: "Chicken Biryani", price: 220 },
    { id: "egg_biryani", name: "Egg Biryani", price: 190 },
    { id: "mutton_biryani", name: "Mutton Biryani", price: 260 },
    { id: "paneer_biryani", name: "Paneer Biryani", price: 200 },
  ],
  desserts: [
    { id: "gulab_jamun", name: "Gulab Jamun", price: 90 },
    { id: "rasgulla", name: "Rasgulla", price: 80 },
    { id: "brownie", name: "Chocolate Brownie", price: 120 },
    { id: "ice_cream", name: "Vanilla Ice Cream", price: 100 },
    { id: "kheer", name: "Kheer", price: 90 },
  ],
  beverages: [
    { id: "masala_tea", name: "Masala Tea", price: 40 },
    { id: "cold_coffee", name: "Cold Coffee", price: 90 },
    { id: "lassi", name: "Sweet Lassi", price: 70 },
    { id: "lemon_soda", name: "Lemon Soda", price: 60 },
    { id: "buttermilk", name: "Chaas / Buttermilk", price: 50 },
  ],
  combos: [
    { id: "combo_veg", name: "Veg Combo Meal", price: 250 },
    { id: "combo_nonveg", name: "Non-Veg Combo Meal", price: 280 },
    { id: "combo_family", name: "Family Combo (4 pax)", price: 499 },
    { id: "combo_biryani", name: "Biryani Combo", price: 299 },
    { id: "combo_snack", name: "Snack Platter", price: 220 },
  ],
};

// ---- WhatsApp sender ----
export async function sendWhatsAppMessage(msg: any) {
  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });
    const text = await res.text();
    if (!res.ok) console.error("WA API Error:", res.status, text);
    else console.log("WA API OK:", res.status, text);
  } catch (err) {
    console.error("sendWhatsAppMessage error:", err);
  }
}

// ---- Builders ----
function buildText(to: string, body: string) {
  return { messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: false } };
}

function buildMenuButton(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Welcome to AV Food Factory 👨‍🍳\nPlease choose a food collection to start." },
      action: {
        buttons: [{ type: "reply", reply: { id: "ACTION_SHOW_CATEGORIES", title: "🍴 Browse Menu" } }],
      },
    },
  };
}

function buildCategoryList(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Menu Categories" },
      body: { text: "Select a food collection:" },
      footer: { text: "Powered by AV Food Factory" },
      action: {
        button: "View Categories",
        sections: [
          {
            title: "Collections",
            rows: CATEGORIES.map((c) => ({ id: `CAT_${c.id}`, title: c.name })),
          },
        ],
      },
    },
  };
}

function buildItemList(to: string, categoryId: string, categoryName: string) {
  const items = MENU[categoryId];
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: `${categoryName} Menu` },
      body: { text: "Select a dish:" },
      footer: { text: "Prices in INR" },
      action: {
        button: "View Items",
        sections: [
          {
            title: categoryName,
            rows: items.map((i) => ({
              id: `MENU_${i.id}`,
              title: i.name,
              description: `₹${i.price}`,
            })),
          },
        ],
      },
    },
  };
}

function buildQtyList(to: string, itemName: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: itemName },
      body: { text: "Select quantity:" },
      footer: { text: "You can change later." },
      action: {
        button: "Choose quantity",
        sections: [
          {
            title: "Quantity",
            rows: Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
              id: `QTY_${n}`,
              title: `${n}`,
              description: n === 1 ? "Single serving" : `${n} servings`,
            })),
          },
        ],
      },
    },
  };
}

function buildDeliveryButtons(to: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Choose delivery type:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "DELIVERY_pickup", title: "🏪 Pickup" } },
          { type: "reply", reply: { id: "DELIVERY_delivery", title: "🚚 Delivery" } },
        ],
      },
    },
  };
}

function buildConfirmButtons(to: string, summary: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: "Confirm Order" },
      body: { text: summary },
      action: {
        buttons: [
          { type: "reply", reply: { id: "CONFIRM_YES", title: "✅ Confirm" } },
          { type: "reply", reply: { id: "CONFIRM_NO", title: "❌ Cancel" } },
        ],
      },
    },
  };
}

// ---- Validators ----
function normalizePhone(s: string) {
  const digits = s.replace(/[^\d]/g, "");
  return digits.length < 10 ? null : digits;
}
function validAddress(s: string) {
  return s.trim().length >= 6;
}
function summarize(order: OrderDraft) {
  const items = order.categoryId ? MENU[order.categoryId] || [] : [];
  const m = items.find((x) => x.id === order.itemId);
  const price = m ? m.price : 0;
  const subtotal = (order.qty || 0) * price;
  return (
    `🧾 *Order Summary*\n\n` +
    `• Category: ${order.categoryName}\n` +
    `• Item: ${order.itemName}\n` +
    `• Qty: ${order.qty}\n` +
    `• Type: ${order.delivery === "pickup" ? "Pickup" : "Delivery"}\n` +
    (order.phone ? `• Phone: ${order.phone}\n` : "") +
    (order.address ? `• Address: ${order.address}\n` : "") +
    (m ? `• Price: ₹${price} × ${order.qty} = ₹${subtotal}\n` : "") +
    `\nReview and confirm below.`
  );
}

// ---- MAIN BOT HANDLER ----
export async function handleIncoming({ from, userMsg }: { from: string; userMsg: string }) {
  if (!userStates.has(from)) userStates.set(from, { step: "INIT", order: {} });
  const state = userStates.get(from)!;
  const to = from;
  const lower = (userMsg || "").trim().toLowerCase();
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // 1. Greet and show categories
  if (state.step === "INIT") {
    if (["hi", "hii", "hello", "hey", "hlo"].includes(lower)) {
      await sendWhatsAppMessage(buildMenuButton(to));
      state.step = "AWAITING_CATEGORY";
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Type *hi* to start your order."));
    return;
  }

  // 2. Show category list
  if (state.step === "AWAITING_CATEGORY") {
    if (postback === "ACTION_SHOW_CATEGORIES") {
      await sendWhatsAppMessage(buildCategoryList(to));
      return;
    }
    if (postback.startsWith("CAT_")) {
      const catId = postback.replace("CAT_", "");
      const cat = CATEGORIES.find((c) => c.id === catId);
      if (!cat) {
        await sendWhatsAppMessage(buildText(to, "Invalid category."));
        await sendWhatsAppMessage(buildCategoryList(to));
        return;
      }
      state.order.categoryId = cat.id;
      state.order.categoryName = cat.name;
      state.step = "AWAITING_MENU";
      await sendWhatsAppMessage(buildItemList(to, cat.id, cat.name));
      return;
    }
    await sendWhatsAppMessage(buildCategoryList(to));
    return;
  }

  // 3. Select menu item
  if (state.step === "AWAITING_MENU") {
    if (postback.startsWith("MENU_")) {
      const itemId = postback.replace("MENU_", "");
      const m = MENU[state.order.categoryId!]?.find((x) => x.id === itemId);
      if (!m) {
        await sendWhatsAppMessage(buildText(to, "Item not found. Try again."));
        await sendWhatsAppMessage(buildItemList(to, state.order.categoryId!, state.order.categoryName!));
        return;
      }
      state.order.itemId = m.id;
      state.order.itemName = m.name;
      state.step = "AWAITING_QTY";
      await sendWhatsAppMessage(buildQtyList(to, m.name));
      return;
    }
    await sendWhatsAppMessage(buildItemList(to, state.order.categoryId!, state.order.categoryName!));
    return;
  }

  // 4. Quantity
  if (state.step === "AWAITING_QTY") {
    if (postback.startsWith("QTY_")) {
      const qty = parseInt(postback.replace("QTY_", ""), 10);
      if (!qty) {
        await sendWhatsAppMessage(buildQtyList(to, state.order.itemName!));
        return;
      }
      state.order.qty = qty;
      state.step = "AWAITING_DELIVERY";
      await sendWhatsAppMessage(buildDeliveryButtons(to));
      return;
    }
    await sendWhatsAppMessage(buildQtyList(to, state.order.itemName!));
    return;
  }

  // 5. Delivery
  if (state.step === "AWAITING_DELIVERY") {
    if (postback.startsWith("DELIVERY_")) {
      const t = postback.replace("DELIVERY_", "") as "pickup" | "delivery";
      state.order.delivery = t;
      state.step = "AWAITING_PHONE";
      await sendWhatsAppMessage(buildText(to, "Please share your *contact number* (e.g., 91XXXXXXXXXX)."));
      return;
    }
    await sendWhatsAppMessage(buildDeliveryButtons(to));
    return;
  }

  // 6. Phone
  if (state.step === "AWAITING_PHONE") {
    const normalized = normalizePhone(userMsg);
    if (!normalized) {
      await sendWhatsAppMessage(buildText(to, "Invalid number. Try again."));
      return;
    }
    state.order.phone = normalized;
    if (state.order.delivery === "pickup") {
      state.step = "AWAITING_CONFIRM";
      await sendWhatsAppMessage(buildConfirmButtons(to, summarize(state.order)));
      return;
    }
    state.step = "AWAITING_ADDRESS";
    await sendWhatsAppMessage(buildText(to, "Please enter your *delivery address*."));
    return;
  }

  // 7. Address
  if (state.step === "AWAITING_ADDRESS") {
    if (!validAddress(userMsg)) {
      await sendWhatsAppMessage(buildText(to, "Address seems short. Try again."));
      return;
    }
    state.order.address = userMsg.trim();
    state.step = "AWAITING_CONFIRM";
    await sendWhatsAppMessage(buildConfirmButtons(to, summarize(state.order)));
    return;
  }

  // 8. Confirm
  if (state.step === "AWAITING_CONFIRM") {
   if (postback === "CONFIRM_YES") {
  const summary = summarize(state.order);

  // 1️⃣ Confirm to User
  await sendWhatsAppMessage(
    buildText(
      to,
      `🎉 *Order Confirmed!*\n\n${summary}\n\nThank you for ordering with AV Food Factory.`
    )
  );

  // 2️⃣ Calculate Total
  const items = MENU[state.order.categoryId!] || [];
  const m = items.find((x) => x.id === state.order.itemId);
  const total = (state.order.qty || 0) * (m?.price || 0);

  // 3️⃣ Save to DB
  try {
    const { Order } = await import("@/models/Order");
    const connectDB = (await import("@/lib/mongodb")).default;
    await connectDB();

    await Order.create({
      from,
      categoryName: state.order.categoryName,
      itemName: state.order.itemName,
      qty: state.order.qty,
      delivery: state.order.delivery,
      phone: state.order.phone,
      address: state.order.address,
      total,
    });

    console.log("🗄️ Order saved to DB successfully");
  } catch (err) {
    console.error("❌ DB save error:", err);
  }

  // 4️⃣ Forward to Admin
  const adminMsg =
    `📩 *New Order*\n` +
    `From: ${from}\n` +
    `Category: ${state.order.categoryName}\n` +
    `Item: ${state.order.itemName}\n` +
    `Qty: ${state.order.qty}\n` +
    `Delivery: ${state.order.delivery}\n` +
    `Phone: ${state.order.phone}\n` +
    `Address: ${state.order.address || "-"}\n` +
    `Total: ₹${total}\n` +
    `\nTime: ${new Date().toLocaleString("en-IN")}`;

  await sendWhatsAppMessage(buildText(ADMIN_PHONE, adminMsg));

  // 5️⃣ Reset user
  userStates.set(from, { step: "INIT", order: {} });
  return;
}

    if (postback === "CONFIRM_NO") {
      await sendWhatsAppMessage(buildText(to, "Order cancelled. Type *hi* to start again."));
      userStates.set(from, { step: "INIT", order: {} });
      return;
    }
    await sendWhatsAppMessage(buildConfirmButtons(to, summarize(state.order)));
    return;
  }

  // Fallback
  await sendWhatsAppMessage(buildText(to, "Type *hi* to start again."));
}
