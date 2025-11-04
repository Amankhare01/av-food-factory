import { NextResponse } from "next/server";
import { Lead } from "@/models/Lead";
import connectDB from "@/lib/mongodb";

export async function POST(request: Request) {
  await connectDB();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });

// DELETE
await Lead.deleteOne({ id });

  return NextResponse.json({ ok:true });
}
