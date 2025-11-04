import { NextResponse } from "next/server";
import { Lead } from "@/models/Lead";
import connectDB from "@/lib/mongodb";

export async function POST(request: Request) {
  await connectDB();
  const { id, status, notes } = await request.json();
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });

  await Lead.updateOne({ id }, { $set: { status, notes } });

  return NextResponse.json({ ok:true });
}
