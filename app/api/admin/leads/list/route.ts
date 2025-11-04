import { NextResponse } from "next/server";
import { Lead } from "@/models/Lead";
import connectDB from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const status = url.searchParams.get("status") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const per = Math.min(100, parseInt(url.searchParams.get("per") || "25"));

    const filter: any = {};

    // keyword search on name / phone / guests / source
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { guests: { $regex: q, $options: "i" } },
        { source: { $regex: q, $options: "i" } },
      ];
    }

    if (status) filter.status = status;

    const total = await Lead.countDocuments(filter);

    const items = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per);

    return NextResponse.json({ ok: true, total, page, per, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
