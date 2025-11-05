import { NextResponse } from "next/server";
import { Lead } from "@/models/Lead";
import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  await connectDB();
  const { id } = await req.json();

  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });

  // correct match
await Lead.deleteOne({ _id: id });

  return NextResponse.json({ ok:true });
}
