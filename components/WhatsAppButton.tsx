'use client';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || '+917317275160';

export default function WhatsAppButton() {
  const msg = encodeURIComponent('Hi AV Food Factory! I want a quick catering quote.');
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace('+','')}/?text=${msg}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg hover:opacity-95 focus:outline-none"
    >
      <span className="text-xl">🟢</span>
      <span className="font-medium">WhatsApp</span>
    </a>
  );
}
