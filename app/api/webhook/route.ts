// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/lib/mongodb";
import {
  MENU,
  getSession,
  buildButtons,
  buildCategoryList,
  buildItemList,
  buildItemCard,
  buildAddToCartButtons,
  buildCartView,
  buildDeliveryTypeButtons,
  buildShareLocationContact,
  buildConfirmOrderButton,
  sessions,
} from "@/lib/botLogic";

// GET: webhook verification for Meta
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  } catch (err) {
    console.error("GET webhook error", err);
    return new NextResponse("Error", { status: 500 });
  }
}

// Helper: send message to WhatsApp Cloud API
async function sendWhatsAppMessage(msg: any) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(msg),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Failed to send WhatsApp message", res.status, txt);
  }
  return res;
}

// POST: incoming webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming webhook:", JSON.stringify(body, null, 2));

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      // handle status updates or other callbacks
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    const from = message.from; // user's phone number (string)
    const session = getSession(from);

    // Determine source of input:
    // - text (regular)
    // - interactive.reply (button/list id)
    // - location message -> message.location
    // - contacts -> message.contacts
    const interactiveReply = message?.interactive?.button_reply?.id || message?.interactive?.list_reply?.id;
    const text = message?.text?.body;
    const location = message?.location;
    const contacts = message?.contacts;

    // 1) Handle interactive replies (buttons or list)
    if (interactiveReply) {
      console.log("Interactive reply id:", interactiveReply);

      // --- top-level buttons ---
      if (interactiveReply === "view_menu") {
        await sendWhatsAppMessage(buildCategoryList(from));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "my_cart") {
        await sendWhatsAppMessage(buildCartView(from, session));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "offers") {
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "🎉 Offers: Buy 1 Get 1 on Pizzas (Mon–Thu). 20% off above ₹1000." },
        });
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "place_order") {
        // ask delivery or pickup
        session.pendingAction = "awaiting_delivery_type";
        await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // --- category selection (id starts with cat_) ---
      if (interactiveReply.startsWith("cat_")) {
        const catId = interactiveReply.replace("cat_", "");
        await sendWhatsAppMessage(buildItemList(from, catId));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // --- item selection (id starts with item_) ---
      if (interactiveReply.startsWith("item_")) {
        const itemId = interactiveReply.replace("item_", "");
        const card = buildItemCard(from, itemId);
        if (card) {
          // send item image card then add qty buttons
          await sendWhatsAppMessage(card);
          await sendWhatsAppMessage(buildAddToCartButtons(from, itemId));
          session.pendingAction = `awaiting_qty_${itemId}`;
        } else {
          await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "Item not found." } });
        }
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // --- quantity buttons: format qty_X_itemId ---
      if (interactiveReply.startsWith("qty_")) {
        // example: qty_2_s_paneer_tikka
        const parts = interactiveReply.split("_");
        // qty, number, itemIdParts...
        const qty = parseInt(parts[1], 10);
        const itemId = parts.slice(2).join("_");
        // find item
        const flat = MENU.flatMap((c) => c.items);
        const it = flat.find((x) => x.id === itemId);
        if (!it) {
          await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "Item not found for adding to cart." } });
          return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }
        // add to cart
        const existing = session.cart.find((c: any) => c.id === it.id);
        if (existing) existing.qty += qty;
        else session.cart.push({ id: it.id, name: it.name, price: it.price, qty });
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: `✅ Added ${qty} x ${it.name} to your cart.` },
        });
        // send cart options
        await sendWhatsAppMessage(buildCartView(from, session));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // delivery type selected
      if (interactiveReply === "delivery" || interactiveReply === "pickup") {
        session.deliveryType = interactiveReply === "delivery" ? "delivery" : "pickup";
        session.pendingAction = session.deliveryType === "delivery" ? "awaiting_location_and_contact" : "awaiting_contact_for_pickup";
        // Prompt user to share location & contact
        await sendWhatsAppMessage(buildShareLocationContact(from, session.deliveryType));
        await sendWhatsAppMessage(buildConfirmOrderButton(from));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // confirm or cancel
      if (interactiveReply === "confirm_order") {
        // require contact and if delivery, location
        // pickup: need contact only
        if (session.deliveryType === "pickup") {
          if (!session.tempOrderMeta.contact) {
            await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "Please share your contact (tap attachment → Contact) so we can confirm pickup." } });
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
          }
          // save order
          await saveOrderFromSession(from, session);
          return new NextResponse("EVENT_RECEIVED", { status: 200 });
        } else {
          // delivery
          if (!session.tempOrderMeta.contact || !session.tempOrderMeta.location) {
            await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "Please share your *location* and *contact* before confirming. Use attachment → Location and Contact." } });
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
          }
          await saveOrderFromSession(from, session);
          return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }
      }

      if (interactiveReply === "cancel_order") {
        // clear session cart & meta
        session.cart = [];
        session.pendingAction = null;
        session.deliveryType = null;
        session.tempOrderMeta = {};
        await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "❌ Order cancelled and cart cleared." } });
        await sendWhatsAppMessage(buildButtons(from, "What would you like to do next?"));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // clear cart action
      if (interactiveReply === "clear_cart") {
        session.cart = [];
        await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "🧹 Cart cleared." } });
        await sendWhatsAppMessage(buildButtons(from, "Anything else?"));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    // 2) Handle location message (user shared location via attachment)
    if (location) {
      // store in session.tempOrderMeta
      session.tempOrderMeta.location = { lat: location.latitude, long: location.longitude };
      await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "📍 Location received. Please share contact (attachment → Contact) or tap Confirm Order." } });
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    // 3) Handle contacts message (user shared contact card)
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      const c = contacts[0];
      const phone = c.phones?.[0]?.phone || c.wa_id || c.phones?.[0]?.wa_id;
      const name = c.name?.formatted_name || `${c.name?.first_name || ""} ${c.name?.last_name || ""}`.trim() || phone;
      session.tempOrderMeta.contact = { name, phone };
      await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: `📞 Contact received: ${name} (${phone}).\nIf everything's good, tap *Confirm Order*` } });
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    // 4) Handle fallback text message (we keep it minimal because we prefer buttons)
    if (text) {
      // Starter greeting if text contains hi
      if (/hi|hello|namaste|hey/i.test(text)) {
        await sendWhatsAppMessage(buildButtons(from, "👋 Welcome to AV Food Factory! Choose an option"));
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }

      // Some platforms send list replies with title instead of id — handle those
      const listReplyTitle = message?.interactive?.list_reply?.title;
      if (listReplyTitle) {
        // attempt to map title to category or item
        // category match
        const cat = MENU.find((c) => c.title.toLowerCase() === listReplyTitle.toLowerCase());
        if (cat) {
          await sendWhatsAppMessage(buildItemList(from, cat.categoryId));
          return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }
        // item match across menu
        const flat = MENU.flatMap((c) => c.items);
        const it = flat.find((i) => i.name.toLowerCase() === listReplyTitle.toLowerCase());
        if (it) {
          await sendWhatsAppMessage(buildItemCard(from, it.id));
          await sendWhatsAppMessage(buildAddToCartButtons(from, it.id));
          session.pendingAction = `awaiting_qty_${it.id}`;
          return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }
      }

      // default: send main buttons
      await sendWhatsAppMessage(buildButtons(from, "I work best with buttons. Choose an option:"));
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}

// Helper: save the current session.cart as an Order in MongoDB
async function saveOrderFromSession(from: string, session: any) {
  try {
    await connectDB();
    const cart = session.cart || [];
    if (cart.length === 0) {
      await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "Your cart is empty. Add items before placing an order." } });
      return;
    }
    const subtotal = cart.reduce((s: number, c: any) => s + c.price * c.qty, 0);
    const orderDoc = await Order.create({
      whatsappFrom: from,
      items: cart.map((c: any) => ({ name: c.name, price: c.price, qty: c.qty })),
      subtotal,
      deliveryType: session.deliveryType || "delivery",
      contact: session.tempOrderMeta.contact || { name: "", phone: "" },
      location: session.tempOrderMeta.location || null,
    });
    // clear session
    session.cart = [];
    session.pendingAction = null;
    session.tempOrderMeta = {};
    session.deliveryType = null;

    // send confirmation message with order id
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body: `✅ Order Received!\nOrder ID: ${orderDoc._id}\nSubtotal: ₹${orderDoc.subtotal}\nWe will confirm shortly. Thank you for ordering from AV Food Factory!`,
      },
    });
    // Optionally send admin notification (if ADMIN_WHATSAPP_NUMBER set)
    if (process.env.ADMIN_WHATSAPP_NUMBER) {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: process.env.ADMIN_WHATSAPP_NUMBER,
        type: "text",
        text: {
          body: `📦 New Order\nID: ${orderDoc._id}\nFrom: ${from}\nSubtotal: ₹${orderDoc.subtotal}`,
        },
      });
    }
  } catch (err) {
    console.error("Error saving order:", err);
    await sendWhatsAppMessage({ messaging_product: "whatsapp", to: from, type: "text", text: { body: "⚠️ Sorry, we couldn't save your order. Please try again later." } });
  }
}
