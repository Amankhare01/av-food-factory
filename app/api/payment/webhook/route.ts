import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

export const runtime = "nodejs";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // Verify webhook signature
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;

    if (!entity) {
      console.error("❌ Missing payment entity");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await connectDB();

    // ✅ Handle successful payments
    if (event === "payment.captured" || entity.status === "captured" || entity.status === "paid") {
      const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
      const paymentId = entity.id;

      const order = await Order.findByIdAndUpdate(
        mongoOrderId,
        { paid: true, status: "paid", paymentId },
        { new: true }
      );

      if (order) {
        // WhatsApp message to customer
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `✅ *Payment Received!*\nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared.\n🧾 Payment ID: ${paymentId}\n\nThank you for ordering from *AV Food Factory*! 🍽️`,
          },
        });

        // WhatsApp message to admin
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: ADMIN_PHONE,
          type: "text",
          text: {
            body: `📦 *Paid Order Confirmed*\nCustomer: ${order.phone}\nItem: ${order.itemName}\nQty: ${order.qty}\nTotal: ₹${order.total}\nPayment ID: ${paymentId}\nTime: ${new Date().toLocaleString("en-IN")}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
