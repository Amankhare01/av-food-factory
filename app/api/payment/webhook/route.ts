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

    if (!signature) {
      console.error("❌ Missing signature header");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // ✅ Verify Signature
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;

    await connectDB();

    if (event === "payment.captured" || entity?.status === "captured" || entity?.status === "paid") {
      const mongoOrderId =
        entity?.notes?.mongoOrderId ||
        entity?.reference_id ||
        entity?.order_id?.split("_")[1]; // fallback

      const order = await Order.findByIdAndUpdate(
        mongoOrderId,
        {
          paid: true,
          status: "paid",
          paymentId: entity.id,
        },
        { new: true }
      );

      if (order) {
        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: order.phone!,
          type: "text",
          text: {
            body: `✅ *Payment Received!*\nYour order for *${order.itemName}* (₹${order.total}) is confirmed and being prepared. 🍽️`,
          },
        });

        await sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: ADMIN_PHONE,
          type: "text",
          text: {
            body: `📦 *Paid Order Confirmed*\nCustomer: ${order.phone}\nItem: ${order.itemName}\nQty: ${order.qty}\nAmount: ₹${order.total}\nPayment ID: ${entity.id}`,
          },
        });
      }
    } else if (event === "payment.failed" || entity?.status === "failed") {
      const mongoOrderId = entity?.notes?.mongoOrderId || entity?.reference_id;
      await Order.findByIdAndUpdate(mongoOrderId, { status: "failed" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
