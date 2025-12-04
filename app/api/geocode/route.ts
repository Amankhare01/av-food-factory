import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${process.env.MAPBOX_SECRET_TOKEN}`;

  const geo = await fetch(url).then((res) => res.json());

  if (!geo.features || geo.features.length === 0) {
    return NextResponse.json({ error: "Unable to geocode address" }, { status: 400 });
  }

  const [lng, lat] = geo.features[0].center;

  return NextResponse.json({ lat, lng });
}
