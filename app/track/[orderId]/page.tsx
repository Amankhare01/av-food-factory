"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function TrackPage({ params }: any) {
  const orderId = params.OrderId;

  const mapRef = useRef(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");

    fetch(`/api/track/verify?orderId=${orderId}&t=${token}`)
      .then((res) => res.json())
      .then((d) => {
        const { lat, lng } = d.order.dropoff;

        const map = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: 14,
        });

        const mapRef = useRef<mapboxgl.Map | null>(null);


        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([lng, lat])
          .addTo(map);

        const evtSrc = new EventSource(
          `/api/track/sse?orderId=${orderId}&t=${token}`
        );

        evtSrc.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (!data.lat) return;

          markerRef.current.setLngLat([data.lng, data.lat]);
          map.easeTo({
            center: [data.lng, data.lat],
            duration: 500,
          });
        };
      });
  }, []);

  return <div id="map" className="w-full h-screen" />;
}
