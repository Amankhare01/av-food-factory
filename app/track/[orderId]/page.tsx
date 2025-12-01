"use client";

import { useEffect, useRef } from "react";
import { io as socketIOClient } from "socket.io-client";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function TrackPage({ params }: any) {
  const orderId = params.OrderId;

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");

    fetch(`/api/track/verify?orderId=${orderId}&t=${token}`)
      .then((res) => res.json())
      .then((d) => {
        const { lat, lng } = d.order.dropoff;

        mapRef.current = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: 14,
        });

        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        const socket = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_URL!);
        socket.emit("join", { orderId });

        socket.on("location:update", (loc: any) => {
          markerRef.current?.setLngLat([loc.lng, loc.lat]);
          mapRef.current?.easeTo({
            center: [loc.lng, loc.lat],
            duration: 500,
          });
        });
      })
      .catch((e) => console.error(e));
  }, []);

  return <div id="map" className="w-full h-screen" />;
}
