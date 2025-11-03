import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // raw body required for signature validation
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Invalid Razorpay webhook signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const payload = JSON.parse(body);

    // ✅ Payment Captured
    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const paymentId = payment.id;
      const amount = payment.amount / 100;
      const phone = payment.contact;

      // Update order as paid (using phone + amount as fallback)
      await connectDB();
      const order = await Order.findOneAndUpdate(
        { phone, total: amount },
        { paid: true, paymentId },
        { new: true }
      );

      if (order) {
        console.log("✅ Payment verified and order updated:", order._id);

        // 🎉 Send WhatsApp confirmation to customer
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `✅ *Payment Received!* \nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️\n\nThank you for ordering with AV Food Factory!`,
          },
        });

        // 📩 Notify admin
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: ADMIN_PHONE,
          type: "text",
          text: {
            body: `📦 *Paid Order Confirmed*\n\nCustomer: ${order.phone}\nItem: ${order.itemName}\nQty: ${order.qty}\nAmount: ₹${order.total}\nDelivery: ${order.delivery}\nAddress: ${order.address || "-"}\n\nPayment ID: ${paymentId}`,
          },
        });
      } else {
        console.warn("⚠️ No matching order found for webhook");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
