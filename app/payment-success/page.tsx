"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentStatusInner() {
  const params = useSearchParams();

  const paymentId = params.get("payment_id");
  const status = params.get("payment_link_status");
  const referenceId = params.get("payment_link_reference_id");

  const success = status === "paid" && paymentId && referenceId;

  useEffect(() => {
    if (success) {
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, referenceId }),
      }).catch((err) => console.error("Confirm fetch error:", err));
    }
  }, [success, paymentId, referenceId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {success ? (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-3">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-700">Thank you — your order is confirmed.</p>
          <p className="text-gray-500 text-sm mt-2">
            You’ll get WhatsApp updates shortly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-3">❌ Payment Failed</h1>
          <p className="text-gray-700">We couldn’t verify your payment.</p>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentStatusInner />
    </Suspense>
  );
}
