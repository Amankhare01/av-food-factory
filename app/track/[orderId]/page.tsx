"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { IOrder } from "@/models/Order";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function TrackPage({ params }: any) {
  const orderId = params.orderId;

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");
    if (!orderId || !token) return;

    fetch(`/api/track/verify?orderId=${orderId}&t=${token}`)
      .then((res) => res.json())
      .then((d) => {
        if (!d.ok) return;

        // Initialize map empty
        mapRef.current = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [0, 0],
          zoom: 2,
        });

        markerRef.current = null;

        // SSE
        const evtSrc = new EventSource(`/api/track/sse?orderId=${orderId}&t=${token}`);

        evtSrc.onmessage = (e) => {
          const data = JSON.parse(e.data);

          if (!data.lat || !data.lng) return;

          // First update → create marker
          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: "blue" })
              .setLngLat([data.lng, data.lat])
              .addTo(mapRef.current!);

            mapRef.current?.setCenter([data.lng, data.lat]);
            mapRef.current?.setZoom(15);
          } else {
            markerRef.current?.setLngLat([data.lng, data.lat]);

            if (!mapRef.current) return;

            mapRef.current.easeTo({
              center: [data.lng, data.lat],
              duration: 500,
            });
          }
        };

        evtSrc.onerror = (err) => console.error("SSE error:", err);
      });
  }, [orderId]);

  return <div id="map" className="w-full h-screen" />;
}
