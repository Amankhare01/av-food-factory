import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { handlePaymentUpdate } from "@/lib/botLogic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

export async function POST(req: Request) {
  console.log("Razorpay Webhook Triggered");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // 1) Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Signature mismatch");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    console.log(" Verified Event:", body.event);

    // 2) Extract payment entity
    const entity =
      body.payload?.payment?.entity ||
      body.payload?.payment_link?.entity ||
      body.payload?.order?.entity;

    if (!entity) {
      console.error(" Missing entity in webhook");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log(" Razorpay Entity:", entity);

    // 3) Extract orderId
    const mongoOrderId = entity.notes?.mongoOrderId || entity.reference_id;

    console.log(" mongoOrderId received:", mongoOrderId);

    if (!mongoOrderId) {
      console.error(" mongoOrderId missing");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 4) Connect DB
    await connectDB();
    console.log(" DB Connected");

    // 5) Update Mongo Order
    const updatedOrder = await Order.findByIdAndUpdate(
      mongoOrderId,
      {
        paid: true,
        status: "paid",
        paymentId: entity.id,
        razorpayOrderId: entity.order_id,
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("❌ No order found:", mongoOrderId);
      return NextResponse.json({ success: false }, { status: 404 });
    }

    console.log(" Order Updated:", updatedOrder._id);

    // 6) Full bot workflow (receipt + customer tracking + driver link)
    await handlePaymentUpdate(mongoOrderId, entity.id);

    console.log(" handlePaymentUpdate DONE");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(" WEBHOOK ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
