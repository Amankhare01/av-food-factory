'use client';

import { useState } from 'react';

export default function CTA() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', guests: '', company: '' });
  const [focused, setFocused] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name || !form.phone) { setErr('Please add your name and phone'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'homepage-cta' }),
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
    <>

      <section
        id="cta"
        className="relative overflow-hidden"
        style={{ background: "#0d0c0b", padding: "7rem 0" }}
      >
        {/* Top rule */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: "700px", height: "300px", background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-5xl px-6 sm:px-12 lg:px-20">

          {/* ── Header ── */}
          <div className="mb-12 text-center">
            <div className="cta-line mx-auto mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

            <div className="cta-body cta-sub mb-3 text-xs tracking-widest uppercase"
              style={{ color: "#d4af37", letterSpacing: "0.25em" }}>
              AV Food Factory · Lucknow
            </div>

            <h2 className="cta-font cta-heading font-light text-white"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              Planning an event <span className="italic">in Lucknow?</span>
            </h2>

            <p className="cta-sub cta-body mt-4 font-light text-white/40 mx-auto"
              style={{ fontSize: "0.95rem", letterSpacing: "0.04em", lineHeight: 1.85, maxWidth: "480px" }}>
              Share your guest count and cuisine mood — we'll craft a personalised Nawabi quote and reach you within minutes.
            </p>
          </div>

          {/* ── Form Card ── */}
          <div className="cta-form relative p-8 sm:p-10"
            style={{ border: "1px solid rgba(212,175,55,0.12)", background: "rgba(255,255,255,0.02)" }}>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
              style={{ borderTop: "1px solid rgba(212,175,55,0.35)", borderLeft: "1px solid rgba(212,175,55,0.35)" }} />
            <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.35)", borderRight: "1px solid rgba(212,175,55,0.35)" }} />

            {ok ? (
              /* ── Success State ── */
              <div className="cta-success flex flex-col items-center gap-5 py-8 text-center">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: "64px", height: "64px", border: "1px solid rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.07)" }}>
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                    <path d="M1 9L8 16L23 1" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="cta-font text-white font-light"
                    style={{ fontSize: "1.6rem" }}>
                    We'll be in touch <span className="italic">shortly</span>
                  </h3>
                  <p className="cta-body mt-2 text-sm text-white/40" style={{ letterSpacing: "0.04em" }}>
                    Our team will reach you on WhatsApp or phone to craft your perfect event menu.
                  </p>
                </div>
                <div className="h-px w-12" style={{ background: "rgba(212,175,55,0.3)" }} />
                <p className="cta-body text-xs text-white/25 tracking-widest uppercase"
                  style={{ letterSpacing: "0.15em" }}>
                  AV Food Factory · Lucknow
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Name */}
                  <div className={`cta-input-wrap ${focused === 'name' ? 'focused' : ''}`}>
                    <label className="cta-body block text-xs mb-2 text-white/30 tracking-widest uppercase"
                      style={{ letterSpacing: "0.15em" }}>
                      Full Name *
                    </label>
                    <input
                      required
                      aria-label="Name"
                      placeholder="Your name"
                      className="cta-input"
                      value={form.name}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className={`cta-input-wrap ${focused === 'phone' ? 'focused' : ''}`}>
                    <label className="cta-body block text-xs mb-2 text-white/30 tracking-widest uppercase"
                      style={{ letterSpacing: "0.15em" }}>
                      WhatsApp / Phone *
                    </label>
                    <div className="flex">
                      <span className="cta-prefix">+91</span>
                      <input
                        required
                        aria-label="Phone"
                        placeholder="10-digit number"
                        className="cta-input"
                        style={{ borderLeft: "none" }}
                        value={form.phone}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused(null)}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value))
                            setForm({ ...form, phone: e.target.value });
                        }}
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                </div>

                {/* Guests */}
                <div className={`cta-input-wrap ${focused === 'guests' ? 'focused' : ''}`}>
                  <label className="cta-body block text-xs mb-2 text-white/30 tracking-widest uppercase"
                    style={{ letterSpacing: "0.15em" }}>
                    Approximate Guest Count
                  </label>
                  <input
                    aria-label="Guests"
                    placeholder="e.g. 150"
                    className="cta-input"
                    value={form.guests}
                    onFocus={() => setFocused('guests')}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value))
                        setForm({ ...form, guests: e.target.value });
                    }}
                    inputMode="numeric"
                  />
                </div>

                {/* Honeypot */}
                <input type="text" aria-hidden="true" tabIndex={-1} autoComplete="off"
                  className="hidden" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })} />

                {/* Error */}
                {err && (
                  <p className="cta-body text-xs flex items-center gap-2"
                    style={{ color: "rgba(212,100,100,0.85)", letterSpacing: "0.04em" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" stroke="rgba(212,100,100,0.7)" />
                      <path d="M6 3.5v3M6 8.5v.5" stroke="rgba(212,100,100,0.9)"
                        strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {err}
                  </p>
                )}

                {/* Submit row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <button type="submit" disabled={loading} className="cta-submit">
                    {loading ? (
                      <><span className="cta-spinner" />Sending…</>
                    ) : (
                      <>
                        Get My Quote
                        <svg className="inline-block ml-3" width="16" height="8" viewBox="0 0 16 8" fill="none">
                          <path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* WhatsApp badge */}
                  <div className="flex items-center gap-2 cta-body text-xs text-white/30"
                    style={{ letterSpacing: "0.08em" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(212,175,55,0.5)">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.122 1.528 5.855L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.964-1.348l-.356-.212-3.762.892.946-3.653-.232-.375A9.818 9.818 0 1112 21.818z" />
                    </svg>
                    Reply via WhatsApp or call
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ── Trust pills ── */}
          {!ok && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                { icon: "🔒", label: "No spam, ever" },
                { icon: "⚡", label: "Quote in minutes" },
                { icon: "🍽️", label: "500+ events served" },
              ].map((p) => (
                <div key={p.label} className="trust-pill">
                  <span style={{ fontSize: "0.8rem" }}>{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>
          )}

          {/* Consent */}
          {!ok && (
            <p className="mt-5 text-center cta-body text-xs text-white/20"
              style={{ letterSpacing: "0.05em" }}>
              By submitting, you agree to be contacted on WhatsApp / SMS for your event enquiry.
            </p>
          )}

        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </section>
    </>
  );
}