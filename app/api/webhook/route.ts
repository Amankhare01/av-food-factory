import { NextRequest, NextResponse } from "next/server";


const menuItems = {
  starters: [
    { name: "Crispy Paneer Tikka", price: "₹180" },
    { name: "Veg Manchurian", price: "₹150" },
    { name: "Chicken 65", price: "₹200" },
  ],
  maincourse: [
    { name: "Butter Chicken", price: "₹250" },
    { name: "Paneer Butter Masala", price: "₹220" },
    { name: "Dal Tadka", price: "₹160" },
  ],
  breads: [
    { name: "Butter Naan", price: "₹40" },
    { name: "Garlic Naan", price: "₹50" },
    { name: "Tandoori Roti", price: "₹25" },
  ],
  desserts: [
    { name: "Gulab Jamun", price: "₹80" },
    { name: "Brownie with Ice Cream", price: "₹120" },
  ],
};

//  Generate menu reply text
function getMenu(category?: string): string {
  if (!category) {
    return (
      "🍴 *AV Food Factory Menu*\n\n" +
      "Type any category name to explore:\n" +
      "👉 *Starters*\n" +
      "👉 *Main Course*\n" +
      "👉 *Breads*\n" +
      "👉 *Desserts*\n\n" +
      "Example: type *starters* or *desserts* to view items."
    );
  }

  const items = menuItems[category.toLowerCase() as keyof typeof menuItems];
  if (!items) return "❌ Sorry, that menu section isn’t available. Try 'menu' to see options.";

  return (
    `🍽️ *${category.toUpperCase()}*\n\n` +
    items.map((i) => `• ${i.name} — ${i.price}`).join("\n") +
    "\n\nType another category or *order* to place your order 🍱"
  );
}

//  Generate bot reply based on user input
async function generateFoodReply(text: string): Promise<string> {
  const msg = text.toLowerCase().trim();

  // Greetings
  if (["hi", "hello", "hey", "namaste"].some((g) => msg.includes(g))) {
    return (
      "👋 *Welcome to AV Food Factory!*\n\n" +
      "We serve delicious Indian & continental dishes 🍛\n\n" +
      "You can ask for:\n" +
      "🍴 *Menu*\n" +
      "🕒 *Timings*\n" +
      "📞 *Contact Info*\n" +
      "💥 *Offers*\n" +
      "🛒 *Order*\n\n" +
      "Type any of these to get started!"
    );
  }

  // Menu requests
  if (msg.includes("menu")) return getMenu();
  if (msg.includes("starter")) return getMenu("starters");
  if (msg.includes("main")) return getMenu("maincourse");
  if (msg.includes("bread")) return getMenu("breads");
  if (msg.includes("dessert")) return getMenu("desserts");

  // Offers
  if (msg.includes("offer") || msg.includes("discount")) {
    return (
      "🎉 *Current Offers at AV Food Factory*\n\n" +
      "🍕 Buy 1 Get 1 on Pizzas (Mon–Thu)\n" +
      "🍛 20% Off on Orders Above ₹1000\n" +
      "🍰 Free Dessert on Weekend Dine-In\n\n" +
      "Type *menu* to explore dishes or *order* to book your table!"
    );
  }

  // Timings
  if (msg.includes("time") || msg.includes("timing") || msg.includes("open")) {
    return "🕒 *AV Food Factory Timings*\n\nMon–Sun: 11:00 AM – 11:00 PM";
  }

  // Contact
  if (msg.includes("contact") || msg.includes("address") || msg.includes("location")) {
    return (
      "📍 *AV Food Factory*\nNear City Mall, Lucknow, UP\n\n" +
      "📞   Call: +91 98765 43210\n" +
      "🌐 www.avfoodfactory.com\n\n" +
      "Type *menu* to browse dishes or *offers* to see deals!"
    );
  }

  // Order
  if (msg.includes("order") || msg.includes("book")) {
    return (
      "🛒 *Order with AV Food Factory!*\n\n" +
      "Please share:\n" +
      "• Dish Name(s)\n" +
      "• Quantity\n" +
      "• Pickup or Delivery\n\n" +
      "Example:\n_order 2x Butter Chicken for delivery_"
    );
  }

  return "🍽️ I can help you with our *menu*, *offers*, *timings*, or *contact details*.\nType *Hi* to start again!";
}

//  VERIFY webhook (Meta GET request)
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
  } catch (err) {
    console.error("Webhook verification error:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

//  HANDLE incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Incoming webhook:", JSON.stringify(body, null, 2));

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (!from || !text) {
      console.log(" No message body detected, skipping...");
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    console.log(`💬 Message from ${from}: ${text}`);

    // Generate restaurant reply
    const reply = await generateFoodReply(text);

    //  Send auto-reply via WhatsApp API
    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: reply },
      }),
    });

    if (!res.ok) {
      const textRes = await res.text();
      console.error("⚠️ Failed to send reply:", res.status, textRes);
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("⚠️ Webhook error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
