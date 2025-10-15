import { NextRequest, NextResponse } from "next/server";

// 🍴 Menu data (with images)
const menu = [
  {
    category: "Starters",
    items: [
      { name: "Paneer Tikka", price: "₹180", img: "https://images.unsplash.com/photo-1604908176997-0553a7d31e2d?w=600" },
      { name: "Chicken 65", price: "₹200", img: "https://images.unsplash.com/photo-1605478037911-9b7a21b88ff5?w=600" },
    ],
  },
  {
    category: "Main Course",
    items: [
      { name: "Butter Chicken", price: "₹250", img: "https://images.unsplash.com/photo-1599309328078-531e88b0ae1b?w=600" },
      { name: "Paneer Butter Masala", price: "₹220", img: "https://images.unsplash.com/photo-1606851091272-99a3d1b7e5a1?w=600" },
    ],
  },
  {
    category: "Desserts",
    items: [
      { name: "Gulab Jamun", price: "₹80", img: "https://images.unsplash.com/photo-1600250399407-821b0e4d78b0?w=600" },
      { name: "Brownie with Ice Cream", price: "₹120", img: "https://images.unsplash.com/photo-1612197527762-9e6d875a16a7?w=600" },
    ],
  },
];

// 🍽️ Generate text-based menu
function getTextMenu() {
  return (
    "🍴 *AV Food Factory Menu*\n\n" +
    menu
      .map(
        (m) =>
          `*${m.category}*\n` +
          m.items.map((i) => `• ${i.name} — ${i.price}`).join("\n")
      )
      .join("\n\n") +
    "\n\nType *order* to place an order or *offers* to see deals 🎉"
  );
}

// 🔘 Create quick reply buttons
function createButtons(to: string, body: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: [
          { type: "reply", reply: { id: "menu", title: "🍽️ View Menu" } },
          { type: "reply", reply: { id: "offers", title: "💥 Offers" } },
          { type: "reply", reply: { id: "contact", title: "📞 Contact" } },
        ],
      },
    },
  };
}

// 🧠 Main logic for message reply
async function generateFoodReply(text: string, from: string) {
  const msg = text.toLowerCase().trim();

  // 🟢 Greeting
  if (["hi", "hello", "hey", "namaste"].some((g) => msg.includes(g))) {
    return createButtons(
      from,
      "👋 *Welcome to AV Food Factory!*\n\nDelicious food, quick service, and great offers await you!\n\nChoose an option below 👇"
    );
  }

  // 🍴 Menu
  if (msg.includes("menu")) {
    return {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: getTextMenu() },
    };
  }

  // 🖼️ Image Menu
  if (msg.includes("starters") || msg.includes("main") || msg.includes("dessert")) {
    const category = msg.includes("starter")
      ? "Starters"
      : msg.includes("main")
      ? "Main Course"
      : "Desserts";

    const selected = menu.find((m) => m.category === category);
    if (!selected) return;

    // Send one image per item
    const responses = selected.items.map((i) => ({
      messaging_product: "whatsapp",
      to: from,
      type: "image",
      image: { link: i.img, caption: `${i.name} — ${i.price}` },
    }));

    return responses;
  }

  // 💥 Offers
  if (msg.includes("offer") || msg.includes("discount")) {
    return {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body:
          "🎉 *Current Offers*\n\n" +
          "🍕 Buy 1 Get 1 on Pizzas (Mon–Thu)\n" +
          "🍛 20% Off above ₹1000\n" +
          "🍰 Free Dessert on Dine-in Weekends\n\nType *menu* to browse dishes!",
      },
    };
  }

  // 📞 Contact
  if (msg.includes("contact") || msg.includes("address") || msg.includes("location")) {
    return {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body:
          "📍 *AV Food Factory*\nNear City Mall, Lucknow, UP\n\n📞 +91 98765 43210\n🌐 www.avfoodfactory.com\n\nOpen Daily: 11 AM – 11 PM 🍽️",
      },
    };
  }

  // 🛒 Order
  if (msg.includes("order")) {
    return {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body:
          "🛒 *Let’s take your order!*\n\nPlease reply with:\n• Dish Name(s)\n• Quantity\n• Pickup or Delivery\n\nExample: _2x Butter Chicken for delivery_",
      },
    };
  }

  // 📆 Reservation
  if (msg.includes("table") || msg.includes("book")) {
    return {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: {
        body:
          "🍽️ *Reserve a Table*\n\nPlease share:\n• Date & Time\n• Number of Guests\n• Name\n\nExample: _Table for 4 at 8 PM tonight under name Rahul_",
      },
    };
  }

  // Default fallback
  return createButtons(from, "I can show you our *Menu*, *Offers*, or *Contact Info*. Choose one below 👇");
}

// ✅ Webhook verification
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Server Error", { status: 500 });
  }
}

// ✅ Handle incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body || message?.interactive?.button_reply?.title;

    if (!from || !text) return new NextResponse("EVENT_RECEIVED", { status: 200 });

    console.log(`💬 Message from ${from}: ${text}`);

    // Get the response (could be text or buttons or multiple images)
    const reply = await generateFoodReply(text, from);

    // Reply can be single object or array of multiple messages
    const replies = Array.isArray(reply) ? reply : [reply];

    for (const msg of replies) {
      const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg),
      });

      if (!res.ok) {
        console.error("⚠️ Failed to send reply:", res.status, await res.text());
      }
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("⚠️ Webhook error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
