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
} from "@/lib/botLogic";

// ✅ Meta verification webhook
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

// ✅ Helper: send message to WhatsApp Cloud API
async function sendWhatsAppMessage(msg: any) {
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
  if (!res.ok) {
    const txt = await res.text();
    console.error("Failed to send WhatsApp message", res.status, txt);
  }
  return res;
}

// ✅ Handle all WhatsApp webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming webhook:", JSON.stringify(body, null, 2));

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new NextResponse("EVENT_RECEIVED", { status: 200 });

    const from = message.from;
    const session = getSession(from);

    const interactiveReply =
      message?.interactive?.button_reply?.id ||
      message?.interactive?.list_reply?.id;
    const text = message?.text?.body;
    const location = message?.location;
    const contacts = message?.contacts;

    // 🧠 Handle Interactive Replies
    if (interactiveReply) {
      console.log("Interactive reply id:", interactiveReply);

      // --- main menu buttons ---
      if (interactiveReply === "view_menu") {
        await sendWhatsAppMessage(buildCategoryList(from));
        return NextResponse.json("OK");
      }
      if (interactiveReply === "my_cart") {
        await sendWhatsAppMessage(buildCartView(from, session));
        return NextResponse.json("OK");
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
        return NextResponse.json("OK");
      }
      if (interactiveReply === "place_order") {
        session.pendingAction = "awaiting_delivery_type";
        await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
        return NextResponse.json("OK");
      }

      // --- category select ---
      if (interactiveReply.startsWith("cat_")) {
        const catId = interactiveReply.replace("cat_", "");
        await sendWhatsAppMessage(buildItemList(from, catId));
        return NextResponse.json("OK");
      }

      // --- item select ---
      if (interactiveReply.startsWith("item_")) {
        const itemId = interactiveReply.replace("item_", "");
        const card = buildItemCard(from, itemId);
        if (card) {
          await sendWhatsAppMessage(card);
          await sendWhatsAppMessage(buildAddToCartButtons(from, itemId));
          session.pendingAction = `awaiting_qty_${itemId}`;
        } else {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: "Item not found." },
          });
        }
        return NextResponse.json("OK");
      }

      // --- quantity select ---
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
            text: { body: "Item not found for adding to cart." },
          });
          return NextResponse.json("OK");
        }
        const existing = session.cart.find((c: any) => c.id === it.id);
        if (existing) existing.qty += qty;
        else session.cart.push({ id: it.id, name: it.name, price: it.price, qty });
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: `✅ Added ${qty} x ${it.name} to your cart.` },
        });
        await sendWhatsAppMessage(buildCartView(from, session));
        return NextResponse.json("OK");
      }

      // --- delivery or pickup ---
      if (interactiveReply === "delivery" || interactiveReply === "pickup") {
        session.deliveryType = interactiveReply;
        session.pendingAction =
          interactiveReply === "delivery"
            ? "awaiting_location_and_contact"
            : "awaiting_contact_for_pickup";
        await sendWhatsAppMessage(buildShareLocationContact(from, session.deliveryType));
        await sendWhatsAppMessage(buildConfirmOrderButton(from));
        return NextResponse.json("OK");
      }

      // --- confirm order ---
      if (interactiveReply === "confirm_order") {
        const meta = session.tempOrderMeta || {};

        if (session.deliveryType === "pickup") {
          if (!meta.contact) {
            await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: {
                body:
                  "📞 Please share your *contact* (tap attachment → Contact) before confirming pickup.",
              },
            });
            return NextResponse.json("OK");
          }
          await saveOrderFromSession(from, session);
          return NextResponse.json("OK");
        }

        // --- delivery case ---
        if (session.deliveryType === "delivery") {
          if (!meta.contact) {
            await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: {
                body:
                  "📞 Please share your *contact* (tap attachment → Contact).",
              },
            });
            return NextResponse.json("OK");
          }
          if (!meta.location) {
            await sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: {
                body:
                  "📍 Please share your *location* (tap attachment → Location).",
              },
            });
            return NextResponse.json("OK");
          }

          // ✅ both contact & location received
          await saveOrderFromSession(from, session);
          return NextResponse.json("OK");
        }

        return NextResponse.json("OK");
      }

      // --- cancel order ---
      if (interactiveReply === "cancel_order") {
        session.cart = [];
        session.pendingAction = null;
        session.deliveryType = null;
        session.tempOrderMeta = {};
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "❌ Order cancelled and cart cleared." },
        });
        await sendWhatsAppMessage(buildButtons(from, "What would you like to do next?"));
        return NextResponse.json("OK");
      }

      // --- clear cart ---
      if (interactiveReply === "clear_cart") {
        session.cart = [];
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "🧹 Cart cleared." },
        });
        await sendWhatsAppMessage(buildButtons(from, "Anything else?"));
        return NextResponse.json("OK");
      }

      return NextResponse.json("OK");
    }

    // 📍 Handle location messages
    if (location) {
      session.tempOrderMeta.location = {
        lat: location.latitude,
        long: location.longitude,
      };
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body:
            "📍 Location received. Please share contact (tap attachment → Contact) or tap *Confirm Order*.",
        },
      });
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return NextResponse.json("OK");
    }

    // 📞 Handle contact messages
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      const c = contacts[0];
      const phone = c.phones?.[0]?.phone || c.wa_id;
      const name =
        c.name?.formatted_name ||
        `${c.name?.first_name || ""} ${c.name?.last_name || ""}`.trim() ||
        phone;
      session.tempOrderMeta.contact = { name, phone };
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: `📞 Contact received: ${name} (${phone}).\nIf everything looks good, tap *Confirm Order*.`,
        },
      });
      await sendWhatsAppMessage(buildConfirmOrderButton(from));
      return NextResponse.json("OK");
    }

    // 🗣️ Handle normal text
    if (text) {
      if (/hi|hello|namaste|hey/i.test(text)) {
        await sendWhatsAppMessage(
          buildButtons(from, "👋 Welcome to AV Food Factory! Choose an option")
        );
        return NextResponse.json("OK");
      }

      await sendWhatsAppMessage(
        buildButtons(from, "I work best with buttons. Choose an option:")
      );
      return NextResponse.json("OK");
    }

    return NextResponse.json("OK");
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}

// ✅ Save order from session
async function saveOrderFromSession(from: string, session: any) {
  try {
    await connectDB();
    const cart = session.cart || [];
    if (cart.length === 0) {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: "Your cart is empty. Add items before placing an order.",
        },
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
      contact: session.tempOrderMeta.contact || { name: "", phone: "" },
      location: session.tempOrderMeta.location || null,
    });

    // reset session
    session.cart = [];
    session.pendingAction = null;
    session.tempOrderMeta = {};
    session.deliveryType = null;

    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body: `✅ Order Received!\nOrder ID: ${orderDoc._id}\nSubtotal: ₹${orderDoc.subtotal}\nWe’ll confirm shortly. Thank you for ordering from AV Food Factory!`,
      },
    });

    // Optional admin alert
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
    await sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body:
          "⚠️ Sorry, we couldn't save your order. Please try again later.",
      },
    });
  }
}
