"use client";

import { useEffect, useState, useRef } from "react";

export default function DriverTrackPage() {
  const [orderId, setOrderId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [addressText, setAddressText] = useState<string | null>(null);
  const [trackingOn, setTrackingOn] = useState(false);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const oid = String(q.get("orderId") || "").trim();
    const did = String(q.get("driverId") || "").trim();

    setOrderId(oid);
    setDriverId(did);

    if (oid) {
      fetch(`/api/track/customer-location?orderId=${oid}`)
        .then((res) => res.json())
        .then((d) => setAddressText(d.address || null));
    }
  }, []);

  const sendLocation = () => {
    if (!driverId || !orderId) return;

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
        }).catch(console.error);
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true }
    );
  };

  const startTracking = () => {
    if (trackingOn) return;
    setTrackingOn(true);
    sendLocation();
    intervalRef.current = setInterval(sendLocation, 5000);
  };

  const stopTracking = () => {
    setTrackingOn(false);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="p-5 text-center space-y-6">
      <h1 className="text-2xl font-bold">Driver Delivery Panel</h1>

      <p>Order ID: <b>{orderId}</b></p>

      {addressText && (
        <div className="p-3 bg-gray-100 rounded">
          <p className="font-semibold">Customer Address</p>
          <p>{addressText}</p>

          <a
            className="block mt-2 p-2 bg-blue-600 text-white rounded"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`}
            target="_blank"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {!trackingOn ? (
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={startTracking}>
          Start Location Sharing
        </button>
      ) : (
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={stopTracking}>
          Stop Sharing
        </button>
      )}
    </div>
  );
}
