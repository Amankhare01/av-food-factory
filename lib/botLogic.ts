
import { userMealStates, handleMealPlanIncoming } from "./mealPlanBot";
import connectDB from "./mongodb";
import { Order } from "@/models/Order";

// ---- ENV ----
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

// ---- Simple in-memory session ----
// Note: For serverless cold starts, you can later swap to Redis with the same API.
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
  mongoId?: string; // populated right after DB create
  categoryId?: string;
  categoryName?: string;
  itemId?: string;
  itemName?: string;
  qty?: number;
  delivery?: "pickup" | "delivery";
  phone?: string;   // delivery phone (not WA sender)
  address?: string;
 dropoff?: { lat: number; lng: number } | null;
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
] as const;

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
      body: { text: "Welcome to AV Food Factory \nPlease choose an option to start." },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ACTION_SHOW_CATEGORIES", title: "🍴 Browse Menu" } },
          { type: "reply", reply: { id: "ACTION_PLAN_MEAL", title: "Plan a Meal" } },
        ],
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
  const items = MENU[categoryId] || [];
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
          { type: "reply", reply: { id: "DELIVERY_pickup", title: " Pickup" } },
          { type: "reply", reply: { id: "DELIVERY_delivery", title: "Delivery" } },
        ],
      },
    },
  };
}

function elide(s: string, n = 900) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function buildConfirmButtons(to: string, summary: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: "Confirm Order" },
      body: { text: elide(summary, 900) },
      action: {
        buttons: [
          { type: "reply", reply: { id: "CONFIRM_YES", title: "Confirm" } },
          { type: "reply", reply: { id: "CONFIRM_NO", title: " Cancel" } },
        ],
      },
    },
  };
}

// Note: cta_url is retained exactly as in your flow.
function buildPaymentButton(to: string, payLink: string, total: number) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      header: { type: "text", text: " Complete Payment" },
      body: { text: `Your total is *₹${total}*.\nTap below to pay securely.` },
      footer: { text: "Powered by Razorpay • AV Food Factory" },
      action: {
        name: "cta_url",
        parameters: { display_text: "💳 Pay Now", url: payLink },
      },
    },
  };
}

// ---- Validators ----
function normalizePhone(s: string) {
  const digits = (s || "").replace(/[^\d]/g, "");
  if (digits.length < 10) return null;
  const local10 = digits.slice(-10);
  return `91${local10}`; // store delivery phone in 91xxxxxxxxxx format
}
function validAddress(s: string) {
  return (s || "").trim().length >= 6;
}
function summarize(order: OrderDraft) {
  const items = order.categoryId ? MENU[order.categoryId] || [] : [];
  const m = items.find((x) => x.id === order.itemId);
  const price = m ? m.price : 0;
  const subtotal = (order.qty || 0) * price;
  return (
    ` *Order Summary*\n\n` +
    `Category: ${order.categoryName}\n` +
    `Item: ${order.itemName}\n` +
    `Qty: ${order.qty}\n` +
    `Type: ${order.delivery === "pickup" ? "Pickup" : "Delivery"}\n` +
    (order.phone ? `• Phone: ${order.phone}\n` : "") +
    (order.address ? `• Address: ${order.address}\n` : "") +
    (m ? `• Price: ₹${price} × ${order.qty} = ₹${subtotal}\n` : "") +
    `\nReview and confirm below.`
  );
}

// ---- MAIN BOT HANDLER ----
export async function handleIncoming({ from, userMsg }: { from: string; userMsg: string }) {
  const to = (from || "").replace("+", ""); // hard normalize WA JID
  if (!userStates.has(to)) userStates.set(to, { step: "INIT", order: {} });
  const state = userStates.get(to)!;

  const lower = (userMsg || "").trim().toLowerCase();
  const isPostback = userMsg.startsWith("__POSTBACK__:");
  const postback = isPostback ? userMsg.replace("__POSTBACK__:", "") : "";

  // ----- Dev shortcuts for admin only -----
  if (to === ADMIN_PHONE) {
    if (lower === "ping") {
      await sendWhatsAppMessage(buildText(to, "pong ✅"));
      return;
    }
    if (lower === "last") {
      try {
        await connectDB();
        const o = await Order.findOne().sort({ createdAt: -1 });
        await sendWhatsAppMessage(buildText(to, o ? JSON.stringify(o, null, 2) : "no orders"));
      } catch {
        await sendWhatsAppMessage(buildText(to, "db error"));
      }
      return;
    }
    if (lower.startsWith("paid ")) {
      const id = lower.replace("paid ", "");
      await handlePaymentUpdate(id, "manual_dev_payment");
      await sendWhatsAppMessage(buildText(to, "manual marked paid "));
      return;
    }
  }



// 0) ROUTE to MealPlan bot if user is in that flow
if (userMealStates.has(to)) {
  await handleMealPlanIncoming({ from: to, userMsg });
  return;
}

  // 1) INIT
  if (state.step === "INIT") {
    const starts = ["hi", "hii", "hello", "hey", "hlo", "start", "menu", "order"];
    if (starts.includes(lower)) {
      await sendWhatsAppMessage(buildMenuButton(to));
      state.step = "AWAITING_CATEGORY";
      return;
    }
    if (lower === "paid") {
      await sendWhatsAppMessage(buildText(to, "We’ll check your latest order status and notify you shortly."));
      return;
    }
    await sendWhatsAppMessage(buildText(to, "Type *hi* to start your order."));
    return;
  }
 
if (postback === "ACTION_PLAN_MEAL") {
  await handleMealPlanIncoming({ from: to, userMsg: postback });
  return;
}
  // 2) CATEGORY
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

  // 3) MENU
  if (state.step === "AWAITING_MENU") {
    if (postback.startsWith("MENU_")) {
      const itemId = postback.replace("MENU_", "");
      const m = state.order.categoryId ? MENU[state.order.categoryId]?.find((x) => x.id === itemId) : null;
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

  // 4) QTY
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

  // 5) DELIVERY TYPE
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

  // 6) PHONE
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

  // 7) ADDRESS
// STEP 7: ADDRESS
if (state.step === "AWAITING_ADDRESS") {
  const addr = userMsg.trim();

  if (!validAddress(addr)) {
    await sendWhatsAppMessage(buildText(to, "Address seems short. Try again."));
    return;
  }

  state.order.address = addr;

  // ───────────────────────────────────────────────
  // GEOCODE CUSTOMER ADDRESS → GET LAT/LNG
  // ───────────────────────────────────────────────
  try {
    const geoRes = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${process.env.MAPBOX_SECRET_TOKEN}`
    );
    const geo = await geoRes.json();

    if (geo?.features?.length > 0) {
      const [lng, lat] = geo.features[0].center;
      state.order.dropoff = { lat, lng };      // ★ SET HERE
      console.log("Dropoff saved:", state.order.dropoff);
    } else {
      console.log("No geocode result, using null");
      state.order.dropoff = null;
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
    state.order.dropoff = null;
  }
  // ───────────────────────────────────────────────

  state.step = "AWAITING_CONFIRM";
  await sendWhatsAppMessage(buildConfirmButtons(to, summarize(state.order)));
  return;
}



  // 8) CONFIRM
  if (state.step === "AWAITING_CONFIRM") {
    if (postback === "CONFIRM_YES") {
      // Idempotency guard for double taps
      if ((state as any).__creating) return;
      (state as any).__creating = true;

      const items = state.order.categoryId ? MENU[state.order.categoryId] || [] : [];
      const m = items.find((x) => x.id === state.order.itemId);
      const price = m?.price || 0;
      const total = (state.order.qty || 0) * price;

      try {
        await sendWhatsAppMessage(
          buildText(
            to,
            ` *Order Confirmed!*\n\n${summarize(state.order)}\n\nPlease proceed to payment below `
          )
        );

        await connectDB();

        // Save order in DB — include `from` for receipt later
// Save order in DB — include dropoff coords
const saved = await Order.create({
  from: to,
  categoryName: state.order.categoryName,
  itemName: state.order.itemName,
  qty: state.order.qty,
  delivery: state.order.delivery,
  phone: state.order.phone,
  address: state.order.address,
  total,
  paid: false,
  status: "created",

  // NEW: save dropoff lat/lng if available
  dropoff: state.order.dropoff || null,
});


        state.order.mongoId = String(saved._id);

        // Request Razorpay Payment Link (your existing route)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            name: state.order.itemName,
            phone: state.order.phone,
            mongoOrderId: saved._id, // only for webhook identification
          }),
        });

        const raw = await res.text();
        console.log("/api/payment raw response:", raw);
        let data: any = {};
        try {
          data = JSON.parse(raw || "{}");
        } catch {
          // Non-JSON error from your API
        }

        if (data?.success && data.paymentLinkUrl) {
          const payLink = data.paymentLinkUrl;

          await Order.findByIdAndUpdate(saved._id, {
            razorpayOrderId: data.razorpayOrderId,
            status: "pending",
          });

          await sendWhatsAppMessage(buildPaymentButton(to, payLink, total));
          await sendWhatsAppMessage(
            buildText(
              to,
              " Please complete your payment to confirm your order. Once payment is verified, you’ll receive your receipt instantly.\nIf you’ve paid and didn’t get a receipt yet, reply *paid* — we’ll double-check instantly."
            )
          );
        } else {
          console.error(" Payment API error:", data);
          await sendWhatsAppMessage(buildText(to, " Could not create payment link. Please try again later."));
        }
      } catch (err) {
        console.error("❌ Payment or DB error:", err);
        await sendWhatsAppMessage(
          buildText(to, " Something went wrong while creating your order. Please try again.")
        );
      } finally {
        (state as any).__creating = false;
      }

      // Notify Admin instantly (with human subtotal line)
      const subtotalLine = `Qty: ${state.order.qty} x ₹${price} = ₹${total}`;
      const adminMsg =
        ` *New Order Received*\n` +
        `Customer (WA): ${to}\n` +
        `Delivery Phone: ${state.order.phone || "—"}\n` +
        `Item: ${state.order.itemName}\n` +
        `${subtotalLine}\n` +
        `Time: ${new Date().toLocaleString("en-IN")}`;
      await sendWhatsAppMessage(buildText(ADMIN_PHONE, adminMsg));

      // Reset user state
      userStates.set(to, { step: "INIT", order: {} });
      return;
    }

    if (postback === "CONFIRM_NO") {
      await sendWhatsAppMessage(buildText(to, "Order cancelled. Type *hi* to start again."));
      await sendWhatsAppMessage(buildMenuButton(to));
      userStates.set(to, { step: "INIT", order: {} });
      return;
    }

    await sendWhatsAppMessage(buildConfirmButtons(to, summarize(state.order)));
    return;
  }

  // 9) Fallback
  await sendWhatsAppMessage(buildText(to, "Type *hi* to start again."));
}

export async function handlePaymentUpdate(mongoOrderId: string, paymentId: string) {
  try {
    console.log(">>> HANDLE PAYMENT UPDATE RUNNING <<<");
    console.log("TRACK_BASE_URL =", process.env.TRACK_BASE_URL);
    console.log("DEFAULT_DRIVER_ID =", process.env.DEFAULT_DRIVER_ID);
    console.log("DEFAULT_DRIVER_PHONE =", process.env.DEFAULT_DRIVER_PHONE);

    await connectDB();
    console.log("Connected to DB");

    // 1) Update order paid
    const order = await Order.findByIdAndUpdate(
      mongoOrderId,
      { paid: true, status: "paid", paymentId },
      { new: true }
    );

    if (!order) {
      console.error("Order not found:", mongoOrderId);
      return;
    }

    const sendTo = (order.from || "").replace("+", "");

    // 2) SEND RECEIPT
    const receipt =
      ` *AV Food Factory Receipt*\n\n` +
      ` Item: ${order.itemName}\n` +
      ` Qty: ${order.qty}\n` +
      ` Total: ₹${order.total}\n` +
      ` Payment ID: ${paymentId}\n\n` +
      `Thank you for ordering!`;

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: sendTo,
      type: "text",
      text: { body: receipt },
    });

    console.log("Receipt sent to:", sendTo);


    // 3) CUSTOMER TRACKING LINK

    const crypto = await import("crypto");
    const customerToken = crypto.randomBytes(32).toString("hex");

    order.trackingToken = customerToken;
    order.deliveryStatus = "assigned";
    await order.save();

    const customerTrackingUrl =
      `${process.env.TRACK_BASE_URL}/track/${order._id}?t=${customerToken}`;

    console.log("Customer tracking URL =", customerTrackingUrl);

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: sendTo,
      type: "text",
      text: {
        preview_url: true,
        body:
          ` *Order Confirmed!*\nYour live tracking link:\n${customerTrackingUrl}`,
      },
    });

    console.log("Customer tracking link sent");


    //  DRIVER TRACKING LINK

    const driverId = process.env.DEFAULT_DRIVER_ID!;
    const driverPhone = process.env.DEFAULT_DRIVER_PHONE!;

    const res = await fetch(`${process.env.TRACK_BASE_URL}/api/driver/send-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order._id, driverId }),
    });

    const data = await res.json();
    console.log("Send-link response:", data);

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: driverPhone,
      type: "text",
      text: {
        preview_url: true,
        body:
          `🚴 *New Delivery Assigned*\n` +
          `Order ID: ${order._id}\n\n` +
          `Start sharing your live location:\n${data.driverTrackingUrl}`,
      },
    });

    console.log("Driver link sent to:", driverPhone);

  } catch (err) {
    console.error("FINAL ERROR:", err);
  }
}


