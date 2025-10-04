"use client";

import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || "+917880561870";

export default function WhatsAppButton() {
  const msg = encodeURIComponent("Hi AV Food Factory! I want a quick catering quote.");
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}/?text=${msg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-10 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-transform duration-300"
    >
      <FaWhatsapp className="text-3xl" />
    </a>
  );
}
