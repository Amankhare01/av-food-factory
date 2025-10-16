import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/lib/mongodb";
import { Session } from "@/lib/sessionModel";
import {
  MENU,
  buildButtons,
  buildCategoryList,
  buildItemList,
  buildItemCard,
  buildAddToCartButtons,
  buildCartView,
  buildDeliveryTypeButtons,
  buildShareLocationContact,
  buildConfirmOrderButton,
} from "@/lib/botLogic";

/* ============================================================
   ✅ SEND WHATSAPP MESSAGE
   ============================================================ */
async function sendWhatsAppMessage(msg: any) {
  try {
    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    const text = await res.text();
    console.log("📥 WhatsApp API Response:", res.status, text);
    if (!res.ok) throw new Error(`Failed to send: ${res.status} ${text}`);
    return text;
  } catch (err) {
    console.error("❌ sendWhatsAppMessage error:", err);
  }
}

/* ============================================================
   ✅ GET OR CREATE SESSION
   ============================================================ */
async function getSession(from: string) {
  await connectDB();
  let session = await Session.findOne({ userPhone: from });
  if (!session) {
    session = await Session.create({
      userPhone: from,
      cart: [],
      deliveryType: null,
      pendingAction: null,
      tempOrderMeta: {},
    });
  }
  return session;
}

/* ============================================================
   ✅ HANDLE INCOMING MESSAGE (botLogic)
   ============================================================ */
async function handleIncomingMessage(message: any) {
  const from = message.from;
  const type = message.type;
  const text = message.text?.body;
  const interactive = message.interactive;
  const location = message.location;
  const contacts = message.contacts;

  console.log("🟢 Message Type:", type);
  const session = await getSession(from);

  // 1️⃣ Text message
  if (text) {
    if (/hi|hello|hey|namaste/i.test(text)) {
      await sendWhatsAppMessage(buildButtons(from, "👋 Welcome to AV Food Factory! Choose an option:"));
    } else {
      await sendWhatsAppMessage(buildButtons(from, "I work best with buttons. Choose an option:"));
    }
    return;
  }

  // 2️⃣ Interactive replies
  const replyId = interactive?.button_reply?.id || interactive?.list_reply?.id;
  if (replyId) {
    console.log("🎯 Reply ID:", replyId);

    if (replyId === "view_menu") return sendWhatsAppMessage(buildCategoryList(from));
    if (replyId === "my_cart") return sendWhatsAppMessage(buildCartView(from, session));
    if (replyId === "offers")
      return sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "🎉 Offer: Buy 1 Get 1 Pizza (Mon–Thu)." },
      });

    if (replyId === "place_order") {
      session.pendingAction = "awaiting_delivery_type";
      await session.save();
      await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
      return;
    }

    if (replyId.startsWith("cat_")) {
      const catId = replyId.replace("cat_", "");
      return sendWhatsAppMessage(buildItemList(from, catId));
    }

    if (replyId.startsWith("item_")) {
      const itemId = replyId.replace("item_", "");
      const card = buildItemCard(from, itemId);
      if (card) {
        await sendWhatsAppMessage(card);
        await sendWhatsAppMessage(buildAddToCartButtons(from, itemId));
        session.pendingAction = `awaiting_qty_${itemId}`;
        await session.save();
      }
      return;
    }

    if (replyId.startsWith("qty_")) {
      const parts = replyId.split("_");
      const qty = parseInt(parts[1], 10);
      const itemId = parts.slice(2).join("_");
      const item = MENU.flatMap((c) => c.items).find((x) => x.id === itemId);
      if (!item) return;

      const existing = session.cart.find((c: any) => c.id === item.id);
      if (existing) existing.qty += qty;
      else session.cart.push({ id: item.id, name: item.name, price: item.price, qty });
      await session.save();

      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: `✅ Added ${qty} x ${item.name} to your cart.` },
      });
      await sendWhatsAppMessage(buildCartView(from, session));
      return;
    }

    if (replyId === "delivery" || replyId === "pickup") {
      session.deliveryType = replyId;
      await session.save();
      await sendWhatsAppMessage(buildShareLocationContact(from, replyId));
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return;
    }

    if (replyId === "confirm_order") return saveOrder(from, session);
    if (replyId === "cancel_order") {
      await Session.deleteOne({ userPhone: from });
      return sendWhatsAppMessage(buildButtons(from, "Order cancelled. Start again?"));
    }
  }

  // 3️⃣ Location sharing
  if (location) {
    session.tempOrderMeta.location = {
      lat: location.latitude,
      long: location.longitude,
    };
    await session.save();
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: "📍 Location received! Now share your contact or confirm." },
    });
    await sendWhatsAppMessage(buildConfirmOrderButton(from));
    return;
  }

  // 4️⃣ Contact sharing
  if (contacts?.length > 0) {
    const c = contacts[0];
    const phone = c.phones?.[0]?.phone || c.wa_id;
    const name = c.name?.formatted_name || phone;
    session.tempOrderMeta.contact = { name, phone };
    await session.save();
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: `📞 Contact saved: ${name} (${phone})` },
    });
    await sendWhatsAppMessage(buildConfirmOrderButton(from));
    return;
  }

  // 5️⃣ Fallback
  await sendWhatsAppMessage(buildButtons(from, "I can only handle text or buttons right now."));
}

/* ============================================================
   ✅ SAVE ORDER TO DB
   ============================================================ */
async function saveOrder(from: string, session: any) {
  try {
    await connectDB();
    const cart = session.cart || [];
    if (cart.length === 0) {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "🛒 Cart is empty." },
      });
      return;
    }

    const subtotal = cart.reduce((s: number, c: any) => s + c.price * c.qty, 0);
    const order = await Order.create({
      whatsappFrom: from,
      items: cart,
      subtotal,
      deliveryType: session.deliveryType || "delivery",
      contact: session.tempOrderMeta.contact || {},
      location: session.tempOrderMeta.location || null,
    });

    await Session.deleteOne({ userPhone: from });

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: `✅ Order placed! ID: ${order._id}\nSubtotal: ₹${subtotal}` },
    });
  } catch (err) {
    console.error("❌ saveOrder() error:", err);
  }
}

/* ============================================================
   ✅ MAIN WEBHOOK (Verification + Message Receiver)
   ============================================================ */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 WhatsApp Webhook Triggered");
    const body = await req.json();
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages || [];

    if (messages.length === 0) {
      console.log("⚠️ No messages (status update).");
      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    for (const message of messages) {
      await handleIncomingMessage(message);
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook POST error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
