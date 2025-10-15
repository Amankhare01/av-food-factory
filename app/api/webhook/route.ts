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

// ✅ Webhook verification
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  } catch (err) {
    console.error("GET webhook error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}

// ✅ Send WhatsApp Message Helper
async function sendWhatsAppMessage(msg: any) {
  try {
    console.log("📤 Sending WhatsApp message:", JSON.stringify(msg, null, 2));

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg),
      }
    );

    const txt = await res.text();
    console.log("📥 WhatsApp API Response:", res.status, txt);

    if (!res.ok) console.error("❌ WhatsApp send error:", txt);
    return res;
  } catch (err) {
    console.error("❌ sendWhatsAppMessage() failed:", err);
  }
}

// ✅ Persistent Session Helper
async function getSession(from: string) {
  await connectDB();
  let session = await Session.findOne({ userPhone: from });
  if (!session) {
    session = await Session.create({
      userPhone: from,
      cart: [],
      pendingAction: null,
      deliveryType: null,
      tempOrderMeta: {},
    });
  }
  return session;
}

// ✅ Webhook POST Handler
export async function POST(req: NextRequest) {
  try {
    console.log("🚀 WhatsApp Webhook Triggered");
    const body = await req.json();
    console.log("📩 Incoming webhook body:", JSON.stringify(body, null, 2));

    // Extract message safely
    const change = body.entry?.[0]?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message) {
      console.log("⚠️ No message payload (status update or template)");
      return NextResponse.json("EVENT_RECEIVED", { status: 200 });
    }

    const from = message.from;
    const messageType = message.type;
    console.log("👤 From:", from, "| Type:", messageType);

    const session = await getSession(from);
    const interactiveReply =
      message?.interactive?.button_reply?.id ||
      message?.interactive?.list_reply?.id;
    const text = message?.text?.body;
    const location = message?.location;
    const contacts = message?.contacts;

    // 1️⃣ Handle interactive button/list replies
    if (interactiveReply) {
      console.log("🎯 Interactive reply:", interactiveReply);

      if (interactiveReply === "view_menu") {
        await sendWhatsAppMessage(buildCategoryList(from));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "my_cart") {
        await sendWhatsAppMessage(buildCartView(from, session));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "offers") {
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: "🎉 Offers: Buy 1 Get 1 on Pizzas (Mon–Thu). 20% off above ₹1000.",
          },
        });
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "place_order") {
        session.pendingAction = "awaiting_delivery_type";
        await session.save();
        await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply.startsWith("cat_")) {
        const catId = interactiveReply.replace("cat_", "");
        await sendWhatsAppMessage(buildItemList(from, catId));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply.startsWith("item_")) {
        const itemId = interactiveReply.replace("item_", "");
        const card = buildItemCard(from, itemId);
        if (card) {
          await sendWhatsAppMessage(card);
          await sendWhatsAppMessage(buildAddToCartButtons(from, itemId));
          session.pendingAction = `awaiting_qty_${itemId}`;
          await session.save();
        } else {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: "Item not found." },
          });
        }
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply.startsWith("qty_")) {
        const parts = interactiveReply.split("_");
        const qty = parseInt(parts[1], 10);
        const itemId = parts.slice(2).join("_");
        const flat = MENU.flatMap((c) => c.items);
        const it = flat.find((x) => x.id === itemId);

        if (!it) {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: "Item not found." },
          });
          return NextResponse.json("EVENT_RECEIVED", { status: 200 });
        }

        const existing = session.cart.find((c: any) => c.id === it.id);
        if (existing) existing.qty += qty;
        else session.cart.push({ id: it.id, name: it.name, price: it.price, qty });
        await session.save();

        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: `✅ Added ${qty} x ${it.name} to your cart.` },
        });
        await sendWhatsAppMessage(buildCartView(from, session));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "delivery" || interactiveReply === "pickup") {
        session.deliveryType = interactiveReply;
        session.pendingAction =
          interactiveReply === "delivery"
            ? "awaiting_location_and_contact"
            : "awaiting_contact_for_pickup";
        await session.save();
        await sendWhatsAppMessage(buildShareLocationContact(from, session.deliveryType));
        await sendWhatsAppMessage(buildConfirmOrderButton(from));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "confirm_order") {
        console.log("🟢 Confirm order clicked:", {
          deliveryType: session.deliveryType,
          meta: session.tempOrderMeta,
          cart: session.cart,
        });

        const meta = session.tempOrderMeta || {};
        if (session.deliveryType === "pickup") {
          if (!meta.contact?.phone) {
            await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: {
                body: "📞 Please share your *contact* (attachment → Contact) before confirming pickup.",
              },
            });
            return NextResponse.json("EVENT_RECEIVED", { status: 200 });
          }
          await saveOrderFromSession(from, session);
          return NextResponse.json("EVENT_RECEIVED", { status: 200 });
        }

        if (session.deliveryType === "delivery") {
          if (!meta.contact?.phone || !meta.location?.lat) {
            await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: {
                body: "📍 Please share your *location* and *contact* before confirming.",
              },
            });
            return NextResponse.json("EVENT_RECEIVED", { status: 200 });
          }

          await saveOrderFromSession(from, session);
          return NextResponse.json("EVENT_RECEIVED", { status: 200 });
        }
      }

      if (interactiveReply === "cancel_order") {
        await Session.deleteOne({ userPhone: from });
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "❌ Order cancelled. Cart cleared." },
        });
        await sendWhatsAppMessage(buildButtons(from, "What would you like to do next?"));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }

      if (interactiveReply === "clear_cart") {
        session.cart = [];
        await session.save();
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "🧹 Cart cleared." },
        });
        await sendWhatsAppMessage(buildButtons(from, "Anything else?"));
        return NextResponse.json("EVENT_RECEIVED", { status: 200 });
      }
    }

    // 2️⃣ Handle location
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
        text: { body: "📍 Location received! Please share contact next." },
      });
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return NextResponse.json("EVENT_RECEIVED", { status: 200 });
    }

    // 3️⃣ Handle contact
    if (contacts?.length > 0) {
      const c = contacts[0];
      const phone = c.phones?.[0]?.phone || c.wa_id;
      const name =
        c.name?.formatted_name ||
        `${c.name?.first_name || ""} ${c.name?.last_name || ""}`.trim() ||
        phone;
      session.tempOrderMeta.contact = { name, phone };
      await session.save();
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: `📞 Contact received: ${name} (${phone})` },
      });
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return NextResponse.json("EVENT_RECEIVED", { status: 200 });
    }

    // 4️⃣ Normal text message or fallback
    const userText =
      text ||
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      message?.button?.text ||
      "[unknown message type]";

    console.log("🗣️ Received text:", userText);

    if (/hi|hello|hey|namaste/i.test(userText)) {
      await sendWhatsAppMessage(
        buildButtons(from, "👋 Welcome to AV Food Factory! Choose an option:")
      );
    } else {
      await sendWhatsAppMessage(
        buildButtons(from, "I work best with buttons. Choose an option:")
      );
    }

    return NextResponse.json("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}

// ✅ Save order & clear session
async function saveOrderFromSession(from: string, session: any) {
  try {
    await connectDB();
    const cart = session.cart || [];
    if (cart.length === 0) {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "🛒 Your cart is empty. Add items before placing an order." },
      });
      return;
    }

    const subtotal = cart.reduce((s: number, c: any) => s + c.price * c.qty, 0);
    const orderDoc = await Order.create({
      whatsappFrom: from,
      items: cart.map((c: any) => ({
        name: c.name,
        price: c.price,
        qty: c.qty,
      })),
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
      text: {
        body: `✅ Order received!\nOrder ID: ${orderDoc._id}\nSubtotal: ₹${orderDoc.subtotal}\nWe'll confirm shortly.`,
      },
    });

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
    console.error("❌ Error saving order:", err);
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body: "⚠️ Sorry, we couldn't save your order. Please try again later.",
      },
    });
  }
}
