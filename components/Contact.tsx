"use client";

import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp } from "react-icons/fa";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  date: string;
  type: string;
  location: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "", phone: "", email: "",
  date: "", type: "", location: "", message: "",
};

export default function ContactPage() {
  const [form, setForm]     = useState<ContactForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [ok, setOk]         = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setOk(true); setForm(initialForm); }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <>

      <section
        id="contact"
        className="relative overflow-hidden"
        style={{ background: "#0d0c0b", minHeight: "100vh", paddingTop: "8rem", paddingBottom: "6rem" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Ambient glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: "700px", height: "280px", background: "radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">

          {/* ── Header ── */}
          <div className="mb-14 text-center">
            <div className="ct-line mx-auto mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />
            <h1 className="ct-font ct-heading font-light text-white"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
              Let's Plan Your <span className="italic">Perfect Event</span>
            </h1>
            <p className="ct-body mt-4 font-light text-white/35 mx-auto"
              style={{ fontSize: "0.92rem", letterSpacing: "0.05em", lineHeight: 1.85, maxWidth: "420px" }}>
              Share your details and we'll craft a bespoke Nawabi catering experience tailored to your celebration.
            </p>
          </div>

          {/* ── Two column layout ── */}
          <div className="grid md:grid-cols-5 gap-8 items-start">

            {/* ── Left info panel (2/5) ── */}
            <div className="ct-left md:col-span-2 flex flex-col gap-5">

              {/* Contact details card */}
              <div className="ct-info-card p-7 relative">
                <div className="absolute top-0 left-0 w-8 h-8"
                  style={{ borderTop: "1px solid rgba(212,175,55,0.4)", borderLeft: "1px solid rgba(212,175,55,0.4)" }} />
                <div className="absolute bottom-0 right-0 w-8 h-8"
                  style={{ borderBottom: "1px solid rgba(212,175,55,0.4)", borderRight: "1px solid rgba(212,175,55,0.4)" }} />

                <div className="mb-1 h-px w-5" style={{ background: "rgba(212,175,55,0.4)" }} />
                <h2 className="ct-font font-light text-white mt-3 mb-6"
                  style={{ fontSize: "1.4rem", letterSpacing: "0.01em" }}>
                  Get in <span className="italic">Touch</span>
                </h2>

                <ul className="ct-body space-y-5 text-sm">
                  {[
                    { Icon: FaEnvelope,  text: "support@avfoodfactory.com", href: "mailto:support@avfoodfactory.com" },
                    { Icon: FaPhoneAlt,  text: "+91 88819 04094",           href: "tel:+918881904094" },
                    { Icon: FaClock,     text: "Mon – Sat  |  9am – 8pm IST", href: null },
                  ].map(({ Icon, text, href }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon size={13} style={{ color: "#d4af37", marginTop: "3px", flexShrink: 0 }} />
                      {href
                        ? <a href={href} className="text-white/45 hover:text-white transition-colors duration-200" style={{ letterSpacing: "0.03em" }}>{text}</a>
                        : <span className="text-white/45" style={{ letterSpacing: "0.03em" }}>{text}</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips card */}
              <div className="ct-info-card p-6">
                <h3 className="ct-font font-light text-white mb-4" style={{ fontSize: "1.1rem" }}>
                  For the best <span className="italic">experience</span>
                </h3>
                <ul className="ct-body space-y-3 text-white/40 text-xs" style={{ letterSpacing: "0.04em", lineHeight: 1.8 }}>
                  {[
                    "Share your event date, time, and guest count.",
                    "Let us know your menu preferences or cuisine theme.",
                    "We'll respond quickly with a tailored Nawabi quote.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", lineHeight: 1 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/917880561870?text=Hello%20AV%20Food%20Factory!%20I%27d%20like%20to%20discuss%20catering%20for%20my%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="ct-wa-btn"
              >
                <FaWhatsapp size={15} />
                Chat on WhatsApp
              </a>
            </div>

            {/* ── Right form panel (3/5) ── */}
            <div className="ct-right md:col-span-3">
              <div className="relative p-8 sm:p-10"
                style={{ border: "1px solid rgba(212,175,55,0.12)", background: "rgba(255,255,255,0.02)" }}>

                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-9 h-9 pointer-events-none"
                  style={{ borderTop: "1px solid rgba(212,175,55,0.4)", borderLeft: "1px solid rgba(212,175,55,0.4)" }} />
                <div className="absolute bottom-0 right-0 w-9 h-9 pointer-events-none"
                  style={{ borderBottom: "1px solid rgba(212,175,55,0.4)", borderRight: "1px solid rgba(212,175,55,0.4)" }} />

                {ok ? (
                  /* ── Success state ── */
                  <div className="ct-success flex flex-col items-center gap-5 py-12 text-center">
                    <div className="flex items-center justify-center rounded-full"
                      style={{ width: "64px", height: "64px", border: "1px solid rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.07)" }}>
                      <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                        <path d="M1 8L8 15L21 1" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="ct-font text-white font-light" style={{ fontSize: "1.7rem" }}>
                        Inquiry <span className="italic">Received</span>
                      </h3>
                      <p className="ct-body mt-2 text-sm text-white/35" style={{ letterSpacing: "0.04em" }}>
                        Our team will reach out on WhatsApp or phone to curate your perfect event menu.
                      </p>
                    </div>
                    <div className="h-px w-12" style={{ background: "rgba(212,175,55,0.3)" }} />
                    <p className="ct-body text-xs text-white/20 tracking-widest uppercase" style={{ letterSpacing: "0.18em" }}>
                      AV Food Factory · Lucknow
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { id: "name", label: "Full Name *", type: "text", placeholder: "Your full name", key: "name" },
                        { id: "phone", label: "Phone / WhatsApp *", type: "tel", placeholder: "+91 XXXXXXXXXX", key: "phone" },
                      ].map(({ id, label, type, placeholder, key }) => (
                        <div key={id}>
                          <label className="ct-body block text-xs mb-2 text-white/30 uppercase tracking-widest"
                            style={{ letterSpacing: "0.15em" }} htmlFor={id}>
                            {label}
                          </label>
                          <div className={`ct-field ${focused === id ? "focused" : ""}`}>
                            <input
                              id={id} type={type} placeholder={placeholder} required={key === "name" || key === "phone"}
                              className="ct-input"
                              value={form[key as keyof ContactForm]}
                              onFocus={() => setFocused(id)}
                              onBlur={() => setFocused(null)}
                              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            />
                            <div className="ct-field-line" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="ct-body block text-xs mb-2 text-white/30 uppercase"
                        style={{ letterSpacing: "0.15em" }} htmlFor="email">
                        Email Address
                      </label>
                      <div className={`ct-field ${focused === "email" ? "focused" : ""}`}>
                        <input id="email" type="email" placeholder="your@email.com"
                          className="ct-input"
                          value={form.email}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <div className="ct-field-line" />
                      </div>
                    </div>

                    {/* Date + Event Type */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { id: "date",  label: "Event Date",  type: "date", placeholder: "",                        key: "date" },
                        { id: "etype", label: "Event Type",  type: "text", placeholder: "Wedding, Corporate…",    key: "type" },
                      ].map(({ id, label, type, placeholder, key }) => (
                        <div key={id}>
                          <label className="ct-body block text-xs mb-2 text-white/30 uppercase"
                            style={{ letterSpacing: "0.15em" }} htmlFor={id}>
                            {label}
                          </label>
                          <div className={`ct-field ${focused === id ? "focused" : ""}`}>
                            <input
                              id={id} type={type} placeholder={placeholder}
                              className="ct-input"
                              value={form[key as keyof ContactForm]}
                              onFocus={() => setFocused(id)}
                              onBlur={() => setFocused(null)}
                              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            />
                            <div className="ct-field-line" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="ct-body block text-xs mb-2 text-white/30 uppercase"
                        style={{ letterSpacing: "0.15em" }} htmlFor="location">
                        Event Location
                      </label>
                      <div className={`ct-field ${focused === "location" ? "focused" : ""}`}>
                        <input id="location" type="text" placeholder="Venue / City"
                          className="ct-input"
                          value={form.location}
                          onFocus={() => setFocused("location")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                        <div className="ct-field-line" />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="ct-body block text-xs mb-2 text-white/30 uppercase"
                        style={{ letterSpacing: "0.15em" }} htmlFor="message">
                        Message / Menu Details
                      </label>
                      <div className={`ct-field ${focused === "message" ? "focused" : ""}`}>
                        <textarea id="message" rows={4}
                          placeholder="Tell us your menu preferences or any special requests…"
                          className="ct-input"
                          value={form.message}
                          onFocus={() => setFocused("message")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                        <div className="ct-field-line" />
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="flex items-start gap-3">
                      <input id="consent" type="checkbox" className="ct-checkbox" required />
                      <label htmlFor="consent" className="ct-body text-xs text-white/30 leading-relaxed"
                        style={{ letterSpacing: "0.04em" }}>
                        I agree to the{" "}
                        <a href="/terms" className="text-white/50 hover:text-[#d4af37] transition-colors underline underline-offset-2">Terms</a>
                        {" "}& {" "}
                        <a href="/privacy" className="text-white/50 hover:text-[#d4af37] transition-colors underline underline-offset-2">Privacy Policy</a>.
                      </label>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} className="ct-submit">
                      {loading
                        ? <><span className="ct-spinner" />Sending…</>
                        : <>Send Inquiry <svg className="inline-block ml-3" width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                      }
                    </button>

                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </section>
    </>
  );
}