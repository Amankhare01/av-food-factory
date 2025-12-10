"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function TrackPage({ params }: any) {
  const orderId = String(params.orderId).trim();

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");
    if (!orderId || !token) return;

    // STEP 1 — Verify order/token before showing map
    fetch(`/api/track/verify?orderId=${orderId}&t=${token}`)
      .then((res) => res.json())
      .then((d) => {
        if (!d.ok) {
          console.error("verify failed", d);
          return;
        }

        // STEP 2 — Create initial map (center India)
        mapRef.current = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [78.9629, 20.5937], // ⭐ India center
          zoom: 4,
        });

        markerRef.current = null;

        // STEP 3 — Subscribe to SSE live location stream
        const evtSrc = new EventSource(
          `/api/track/sse?orderId=${orderId}&t=${token}`
        );

        evtSrc.onmessage = (e) => {
          let data;
          try {
            data = JSON.parse(e.data);
          } catch {
            return;
          }

          if (!data.lat || !data.lng) return;

          // ⭐ FIRST DRIVER LOCATION — create marker
          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({
              color: "#007bff", // blue
            })
              .setLngLat([data.lng, data.lat])
              .addTo(mapRef.current!);

            mapRef.current?.setCenter([data.lng, data.lat]);
            mapRef.current?.setZoom(15);
            return;
          }

          // ⭐ SUBSEQUENT UPDATES — move marker smoothly
          markerRef.current?.setLngLat([data.lng, data.lat]);

          mapRef.current?.easeTo({
            center: [data.lng, data.lat],
            duration: 500,
          });
        };

        evtSrc.onerror = (err) => {
          console.error("SSE error:", err);
        };
      });
  }, [orderId]);

  return (
    <div
      id="map"
      className="w-full h-screen"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
