import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppMessage } from "@/lib/botLogic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // disable caching
export const preferredRegion = "iad1";  // force Node.js runtime

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_NUMBER || "916306512288").replace("+", "");

export async function POST(req: Request) {
  console.log(" Razorpay Webhook Triggered");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const sig = req.headers.get("x-razorpay-signature");
    const raw = await req.text();

    //  Step 1: Verify signature
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sig) {
      console.error(" Signature mismatch!");
      console.log("Expected:", expected);
      console.log("Got:", sig);
      return NextResponse.json({ success: false, reason: "bad-signature" }, { status: 400 });
    }

    const body = JSON.parse(raw);
    console.log(" Verified Razorpay Event:", body.event);

    // Step 2: Identify payment entity
    const entity =
      body.payload?.payment?.entity ||
      body.payload?.payment_link?.entity ||
      body.payload?.order?.entity;

    if (!entity) {
      console.error(" Missing entity in webhook payload");
      return NextResponse.json({ success: false, reason: "no-entity" }, { status: 400 });
    }

    // Step 3: Connect DB
    await connectDB();

    // Step 4: Extract Mongo Order ID
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;
    console.log("Mongo Order ID:", mongoOrderId);

    if (!mongoOrderId) {
      console.error("❌ mongoOrderId not found in payload");
      return NextResponse.json({ success: false, reason: "no-orderid" }, { status: 400 });
    }

    // Step 5: Update Order
    const updated = await Order.findByIdAndUpdate(
      mongoOrderId,
      {
        paid: true,
        status: "paid",
        razorpayOrderId: entity.order_id,
        paymentId: entity.id,
      },
      { new: true }
    );

    if (!updated) {
      console.error(" No matching order found for ID:", mongoOrderId);
      return NextResponse.json({ success: false, reason: "order-not-found" }, { status: 404 });
    }

    console.log(" Order updated successfully in DB:", updated._id);

    // Step 6: Build Receipt Message
    const receiptMsg = ` *AV Food Factory Receipt*\n\n *Item:* ${updated.itemName}\n *Qty:* ${updated.qty}\n *Total:* ₹${updated.total}\n *Payment ID:* ${updated.paymentId}\n *Status:* Confirmed\n ${new Date().toLocaleString("en-IN")}\n\nThank you for ordering from *AV Food Factory*!`;

    const adminMsg = ` *Paid Order Confirmed*\n\n Customer: ${updated.phone}\n Item: ${updated.itemName}\n Qty: ${updated.qty}\n Total: ₹${updated.total}\n Payment ID: ${updated.paymentId}\n ${new Date().toLocaleString("en-IN")}`;

    //  Step 7: Send WhatsApp receipts (Customer + Admin)
    try {
      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: updated.phone!,
        type: "text",
        text: { body: receiptMsg },
      });
      console.log(" WhatsApp sent to customer:", updated.phone);

      await sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: ADMIN_PHONE,
        type: "text",
        text: { body: adminMsg },
      });
      console.log("WhatsApp sent to admin:", ADMIN_PHONE);
    } catch (waErr) {
      console.error("WhatsApp send failed:", waErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(" Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
