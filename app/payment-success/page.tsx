"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function DebugPaymentPageContent() {
  const params = useSearchParams();

  useEffect(() => {
    console.log("Razorpay redirect params:", Object.fromEntries(params.entries()));
  }, [params]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-bold">Debugging Payment Redirect</h1>
      <p>Open your browser console after a payment to see the parameters Razorpay sends.</p>
    </div>
  );
}

export default function DebugPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading payment status...</div>}>
      <DebugPaymentPageContent />
    </Suspense>
  );
}
