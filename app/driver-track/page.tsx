"use client";

import { useEffect, useState } from "react";

export default function DriverTrackPage() {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    setDriverId(params.get("driverId"));
    setOrderId(params.get("orderId"));
  }, []);

  useEffect(() => {
    if (!driverId || !orderId) return;

    function sendLocation() {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch("/api/driver/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-driver-key": process.env.NEXT_PUBLIC_DRIVER_KEY!,
            },
            body: JSON.stringify({
              driverId,
              orderId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
        },
        (err) => console.error("Location Err:", err),
        { enableHighAccuracy: true }
      );
    }

    const interval = setInterval(sendLocation, 5000);
    sendLocation();

    return () => clearInterval(interval);
  }, [driverId, orderId]);

  return (
    <div className="p-4 text-center">
      <h1>Driver Location Active</h1>
      <p>Your location is being sent…</p>
    </div>
  );
}
