"use client";
import { useState } from "react";

export default function CTA() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", guests: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.name || !form.phone) {
      setErr("Please add your name and phone");
      return;
    }

    setLoading(true);
    try {
      // Build WhatsApp message
      const message = encodeURIComponent(
        `Hello AV Food Factory 👋\n\nI'm ${form.name}.\nHere are my details:\n📞 Contact: ${form.phone}\n👥 Guests: ${
          form.guests || "Not specified"
        }\n\nPlease share a catering quote for my upcoming event.`
      );

      const whatsappNumber = "917880561870";
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

      // Redirect user to WhatsApp
      window.open(whatsappURL, "_blank");
    } catch (error: any) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="cta" className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-nawab-emerald to-nawab-emeraldDeep" />
      <div className="mx-auto max-w-7xl px-4 py-14 text-white">
        <h2 className="font-heading text-3xl md:text-4xl">
          Planning an event in Lucknow?
        </h2>
        <p className="mt-2 text-white/90">
          Tell us your guest count and cuisine mood—we’ll send a curated quote
          instantly on WhatsApp.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3"
        >
          <input
            required
            aria-label="Name"
            placeholder="Your name"
            className="h-12 rounded-xl px-4 text-black"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            aria-label="Phone"
            placeholder="Phone / WhatsApp"
            className="h-12 rounded-xl px-4 text-black"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            aria-label="Guests"
            placeholder="Guests (approx.)"
            className="h-12 rounded-xl px-4 text-black"
            value={form.guests}
            onChange={(e) => setForm({ ...form, guests: e.target.value })}
          />
          <button
            disabled={loading}
            className="h-12 rounded-xl bg-nawab-gold px-6 font-medium text-ink hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Opening…" : "Get Quote"}
          </button>
        </form>

        {err && <p className="mt-3 text-sm text-red-100/90">{err}</p>}
        <p className="mt-3 text-xs text-white/80">
          By submitting, you’ll be redirected to WhatsApp to confirm your event
          quote.
        </p>
      </div>
    </section>
  );
}
