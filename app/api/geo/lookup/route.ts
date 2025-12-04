import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ ok: false, error: "Address required" }, { status: 400 });
    }

    const MAPBOX_SECRET = process.env.MAPBOX_SECRET_TOKEN!;
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      address
    )}&access_token=${MAPBOX_SECRET}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.features || !data.features.length) {
      return NextResponse.json({ ok: false, error: "Invalid address" });
    }

    const [lng, lat] = data.features[0].geometry.coordinates;

    return NextResponse.json({
      ok: true,
      lat,
      lng,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
