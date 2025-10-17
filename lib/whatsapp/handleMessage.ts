import { connectDB, Order } from "@/lib/mongodb";
import { Session } from "@/lib/sessionModel";
import { sendWhatsAppMessage } from "./sendMessage";
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

// ✅ Get or create session
export async function getSession(from: string) {
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


export async function handleIncomingMessage(message: any) {
  console.log("hndle incmoing message ....");
  const from = message.from;
  const type = message.type;
  const text = message.text?.body;
  const interactive = message.interactive;
  const location = message.location;
  const contacts = message.contacts;

  console.log("🟢 Received Message Type:", type);

  console.log("text = ",text);
  const session = await getSession(from);
  console.log("Session fro ", from, ":", session);
  if (text) {
    console.log("💬 Text Message:", text) ;
    if (/hi|hello|hey|namaste/i.test(text)) {
      await sendWhatsAppMessage(
        buildButtons(from, "👋 Welcome to AV Food Factory! Choose an option:")
      );
    } else {
      await sendWhatsAppMessage(
        buildButtons(from, "I work best with buttons. Choose an option:")
      );
    }
    return;
  }

  // 2️⃣ If interactive message
  const replyId =
    interactive?.button_reply?.id || interactive?.list_reply?.id;
  if (replyId) {
    console.log("🎯 Interactive Reply:", replyId);

    if (replyId === "view_menu") {
      await sendWhatsAppMessage(buildCategoryList(from));
      return;
    }

    if (replyId === "my_cart") {
      await sendWhatsAppMessage(buildCartView(from, session));
      return;
    }

    if (replyId === "offers") {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "🎉 Offers: Buy 1 Get 1 Pizza (Mon–Thu)." },
      });
      return;
    }

    if (replyId === "place_order") {
      session.pendingAction = "awaiting_delivery_type";
      await session.save();
      await sendWhatsAppMessage(buildDeliveryTypeButtons(from));
      return;
    }

    if (replyId.startsWith("cat_")) {
      const catId = replyId.replace("cat_", "");
      await sendWhatsAppMessage(buildItemList(from, catId));
      return;
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

    if (replyId === "confirm_order") {
      await saveOrder(from, session);
      return;
    }

    if (replyId === "cancel_order") {
      await Session.deleteOne({ userPhone: from });
      await sendWhatsAppMessage(buildButtons(from, "Order cancelled. Start again?"));
      return;
    }
  }

  // 3️⃣ If location shared
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

  // 4️⃣ If contact shared
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

  // 5️⃣ Fallback for unknown types
  await sendWhatsAppMessage(
    buildButtons(from, "I can only handle text or button inputs right now.")
  );
}

// ✅ Save order to DB
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
