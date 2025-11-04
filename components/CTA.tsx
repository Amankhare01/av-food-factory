'use client';
import { useState } from 'react';

export default function CTA() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', guests: '', company: '' }); // company = honeypot

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name || !form.phone) { setErr('Please add your name and phone'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'homepage-cta' })
      });
      const data = await res.json();
      if (data.ok) {
        setOk(true);
        setForm({ name: '', phone: '', guests: '', company: '' });
      } else {
        setErr(data.error || 'Something went wrong');
      }
    } catch (e: any) {
      setErr(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="cta" className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-nawab-emerald to-nawab-emeraldDeep" />
      <div className="mx-auto max-w-7xl px-4 py-14 text-white">
        <h2 className="font-heading text-3xl md:text-4xl">Planning an event in Lucknow?</h2>
        <p className="mt-2 text-white/90">Tell us your guest count and cuisine mood—we’ll send a curated quote in minutes.</p>

        {ok ? (
          <p className="mt-6 rounded-xl bg-white/10 px-4 py-3">Thanks! We’ll reach out shortly on WhatsApp/Phone.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <input
              required
              aria-label="Name"
              placeholder="Your name"
              className="h-12 rounded-xl px-4 text-black"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex">
              <span className="h-12 flex items-center px-3 rounded-l-xl bg-gray-100 text-black text-sm font-medium select-none border border-r-0 border-gray-300">
                +91
              </span>
            
              <input
                required
                aria-label="Phone"
                placeholder="Phone / WhatsApp"
                className="h-12 rounded-r-xl px-4 text-black border border-gray-300"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setForm({ ...form, phone: value });
                  }
                }}
                maxLength={10}
                inputMode="numeric"
              />
            </div>


            <input
              required
              aria-label="Guests"
              placeholder="Guests (approx.)"
              className="h-12 rounded-xl px-4 text-black"
              value={form.guests}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setForm({ ...form, guests: value });
                }
              }}
              inputMode="numeric"
            />

            {/* Honeypot (hidden) */}
            <input
              type="text"
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <button
              disabled={loading}
              className="h-12 rounded-xl bg-nawab-gold px-6 font-medium text-ink hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Get Quote'}
            </button>
          </form>
        )}

        {err && <p className="mt-3 text-sm text-red-100/90">{err}</p>}
        <p className="mt-3 text-xs text-white/80">By submitting, you agree to be contacted on WhatsApp/SMS for your event.</p>
      </div>
    </section>
  );
}
