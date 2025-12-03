"use client";

import { useEffect, useState, useRef } from "react";

export default function DriverTrackPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [dropoff, setDropoff] = useState<any>(null);
  const [trackingOn, setTrackingOn] = useState(false);

  const intervalRef = useRef<any>(null);

  // Step 1 — Read URL Params on client-side only
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setOrderId(q.get("orderId"));
    setDriverId(q.get("driverId"));

    // Fetch dropoff location for showing customer address/map
    if (q.get("orderId")) {
      fetch(`/api/track/customer-location?orderId=${q.get("orderId")}`)
        .then((res) => res.json())
        .then((d) => setDropoff(d.dropoff || null));
    }
  }, []);

  // Step 2 — Function to send location
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
        });
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true }
    );
  };

  // Step 3 — Start sharing location
  const startTracking = () => {
    if (trackingOn) return;
    setTrackingOn(true);

    sendLocation(); // Send immediately
    intervalRef.current = setInterval(sendLocation, 5000);
  };

  // Step 4 — Stop sharing location
  const stopTracking = () => {
    setTrackingOn(false);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="p-5 text-center space-y-6">
      <h1 className="text-2xl font-bold">Driver Delivery Panel</h1>

      <p className="text-gray-700">
        Order ID: <b>{orderId}</b>
      </p>

      {dropoff && (
        <div className="p-3 bg-gray-100 rounded">
          <p className="font-semibold">Customer Location</p>
          <p>{dropoff.lat}, {dropoff.lng}</p>

          <a
            className="block mt-2 p-2 bg-blue-600 text-white rounded"
            href={`https://www.google.com/maps/dir/?api=1&destination=${dropoff.lat},${dropoff.lng}`}
            target="_blank"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {/* Tracking Controls */}
      {!trackingOn ? (
        <button
          onClick={startTracking}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Location Sharing
        </button>
      ) : (
        <button
          onClick={stopTracking}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Location Sharing
        </button>
      )}

      <p className="text-sm text-gray-600">
        Status:{" "}
        <b className={trackingOn ? "text-green-600" : "text-red-600"}>
          {trackingOn ? "Sharing live location…" : "Not sharing"}
        </b>
      </p>
    </div>
  );
}
