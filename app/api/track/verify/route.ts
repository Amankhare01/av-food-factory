import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order, IOrder } from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    const t = url.searchParams.get("t");

    if (!orderId || !t) {
      return NextResponse.json({ ok: false, error: "orderId & token required" }, { status: 400 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ ok: false, error: "invalid orderId" }, { status: 400 });
    }

    
    const result = await Order.findById(orderId).lean();
    const order = result as unknown as IOrder | null;

    if (!order) {
      return NextResponse.json({ ok: false, error: "order not found" }, { status: 404 });
    }

   
    if (order.trackingToken !== t) {
      return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      address: order.address ?? null,
    });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
