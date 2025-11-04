"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentStatus() {
  const params = useSearchParams();
  const paymentId = params.get("razorpay_payment_id");
  const orderId = params.get("razorpay_order_id");
  const signature = params.get("razorpay_signature");

  const status = paymentId && orderId && signature ? "success" : "failed";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {status === "success" ? (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-800 mb-2">
            Thank you — your order is confirmed.
          </p>
          <p className="text-gray-500 text-sm">
            You’ll receive WhatsApp updates shortly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            ❌ Payment Failed
          </h1>
          <p className="text-gray-700">
            Please try again or contact support.
          </p>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <PaymentStatus />
    </Suspense>
  );
}
