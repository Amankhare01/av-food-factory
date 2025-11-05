"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function PaymentStatus() {
  const params = useSearchParams();

  // Payment Link params (Razorpay Payment Links)
  const plStatus = params.get("payment_link_status");
  const paymentId = params.get("payment_id");
  const referenceId = params.get("payment_link_reference_id");

  // Checkout.js fallback
  const razorpayPaymentId = params.get("razorpay_payment_id");
  const razorpayOrderId = params.get("razorpay_order_id");
  const razorpaySignature = params.get("razorpay_signature");

  const isLinkSuccess = plStatus === "paid";
  const isCheckoutSuccess = razorpayPaymentId && razorpayOrderId && razorpaySignature;
  const success = isLinkSuccess || isCheckoutSuccess;

  // 🚀 Instant backend update
  useEffect(() => {
    const confirmPayment = async () => {
      if (success) {
        await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceId,
            paymentId: paymentId || razorpayPaymentId,
          }),
        });
      }
    };
    confirmPayment();
  }, [success, referenceId, paymentId, razorpayPaymentId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {success ? (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-800 mb-2">Thank you — your order is confirmed.</p>
          <p className="text-gray-500 text-sm">
            You’ll receive WhatsApp updates shortly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Failed</h1>
          <p className="text-gray-700 mb-2">
            We couldn’t verify your payment.
          </p>
          <p className="text-gray-500 text-sm">
            If amount was deducted, you’ll get WhatsApp confirmation soon.
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
