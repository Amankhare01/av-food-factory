import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order, IOrder } from "@/models/Order";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId).lean() as IOrder | null;

    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    return NextResponse.json({
      address: order.address || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
