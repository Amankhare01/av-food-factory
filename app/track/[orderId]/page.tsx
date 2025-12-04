"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function TrackPage({ params }: any) {

  const orderId = params.orderId;  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");

    console.log("orderId =", orderId, "token =", token);

    if (!orderId || !token) {
      console.error("Missing orderId or token");
      return;
    }

    fetch(`/api/track/verify?orderId=${orderId}&t=${token}`)
      .then((res) => res.json())
      .then((d) => {

        if (!d.ok) {
          console.error("Verify failed", d);
          return;
        }

        const { lat, lng } = d.order.dropoff;

        // Create MAP
        mapRef.current = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: 14,
        });

        // Create MARKER
        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // SSE connection
        const evtSrc = new EventSource(
          `/api/track/sse?orderId=${orderId}&t=${token}`
        );

        evtSrc.onmessage = (e) => {
          const data = JSON.parse(e.data);
          console.log("SSE update:", data);

          if (!data.lat || !data.lng) return;

          markerRef.current?.setLngLat([data.lng, data.lat]);
          mapRef.current?.easeTo({
            center: [data.lng, data.lat],
            duration: 500,
          });
        };

        evtSrc.onerror = (e) => {
          console.error("SSE error:", e);
        };
      })
      .catch((err) => {
        console.error("TRACK INIT ERROR:", err);
      });
  }, [orderId]);

  return <div id="map" className="w-full h-screen" />;
}
