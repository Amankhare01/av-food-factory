"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const paymentId = params.get("razorpay_payment_id");
    const orderId = params.get("razorpay_order_id");
    const signature = params.get("razorpay_signature");

    if (paymentId && orderId && signature) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }, [params]);

  if (!status)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <h2 className="text-xl font-semibold">Verifying your payment...</h2>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center px-4">
      {status === "success" ? (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-800 mb-2">
            Thank you for your payment — your order is now confirmed.
          </p>
          <p className="text-gray-500 text-sm">
            You’ll receive WhatsApp updates from AV Food Factory shortly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            ❌ Payment Failed
          </h1>
          <p className="text-gray-700">
            Something went wrong. Please try again or contact support.
          </p>
        </>
      )}
    </div>
  );
}
