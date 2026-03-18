"use client";

import { useState } from "react";

const items = [
  {
    title: "Authentic Awadhi",
    desc: "Galouti, Kakori, Lucknowi Biryani, Sheermal & more — recipes perfected over generations.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L13.2 8.2H20L14.4 11.8L16.6 18L11 14.4L5.4 18L7.6 11.8L2 8.2H8.8L11 2Z"
          fill="#d4af37" fillOpacity="0.9" />
      </svg>
    ),
    number: "01",
  },
  {
    title: "Design-Led Buffet",
    desc: "Ivory linens, brass accents, crafted labels — a timeless Nawabi aesthetic for every table.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="14" width="16" height="2" rx="1" fill="#d4af37" fillOpacity="0.9"/>
        <rect x="6" y="10" width="10" height="4" rx="1" fill="#d4af37" fillOpacity="0.5"/>
        <path d="M8 10V7a3 3 0 016 0v3" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round"/>
        <rect x="2" y="16" width="18" height="2" rx="1" fill="#d4af37" fillOpacity="0.3"/>
      </svg>
    ),
    number: "02",
  },
  {
    title: "End-to-End",
    desc: "Menu curation, live counters, service staff, rentals, and decor partners — all under one roof.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.6"/>
        <path d="M11 3v8l5 3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    number: "03",
  },
  {
    title: "Dietary Friendly",
    desc: "Jain, vegan, gluten-free & kids menus with fully separate preparation protocols.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7 3 4 6 4 10c0 5 7 10 7 10s7-5 7-10c0-4-3-7-7-7z"
          stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.7"/>
        <path d="M8 10l2 2 4-4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    number: "04",
  },
];

export default function USPs() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>

      <section
        id="services"
        className="relative"
        style={{ background: "#0d0c0b", padding: "7rem 0" }}
      >
        {/* Subtle top border */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />

        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">

          {/* ── Section Header ── */}
          <div className="mb-14">
            <div className="usp-section-line mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="usp-font usp-section-title font-light text-white leading-none"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.01em" }}>
                Why hosts <span className="italic">choose us</span>
              </h2>
              <p className="usp-section-sub usp-body font-light text-white/40 max-w-xs text-sm leading-relaxed"
                style={{ letterSpacing: "0.03em" }}>
                Four pillars that make every LaMaison event an experience never forgotten.
              </p>
            </div>
          </div>

          {/* ── Cards Grid ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="usp-card p-7"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Corner accent */}
                <div className="usp-card-corner" />

                {/* Number */}
                <div className="usp-body text-xs mb-6"
                  style={{ color: "rgba(212,175,55,0.3)", letterSpacing: "0.2em" }}>
                  {item.number}
                </div>

                {/* Icon ring */}
                <div className="usp-icon-ring mb-5 flex items-center justify-center rounded-full"
                  style={{
                    width: "48px",
                    height: "48px",
                    border: "1px solid rgba(212,175,55,0.25)",
                    background: "rgba(212,175,55,0.05)",
                  }}>
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="usp-font font-light text-white mb-3"
                  style={{ fontSize: "1.35rem", letterSpacing: "0.01em" }}>
                  {item.title}
                </h3>

                {/* Divider */}
                <div className="mb-3 h-px transition-all duration-500"
                  style={{
                    width: hovered === i ? "2rem" : "1rem",
                    background: "#d4af37",
                    opacity: hovered === i ? 0.8 : 0.3,
                  }} />

                {/* Description */}
                <p className="usp-body font-light text-white/50 text-sm leading-relaxed"
                  style={{ letterSpacing: "0.02em" }}>
                  {item.desc}
                </p>

                {/* Hover arrow */}
                <div className="mt-5 flex items-center gap-2 transition-all duration-400"
                  style={{ opacity: hovered === i ? 1 : 0, transform: hovered === i ? "translateX(0)" : "translateX(-8px)" }}>
                  <span className="usp-body text-xs tracking-widest uppercase"
                    style={{ color: "#d4af37", letterSpacing: "0.18em" }}>
                    Learn more
                  </span>
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <path d="M0 4h14M10 1l4 3-4 3" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom stat bar ── */}
          <div className="mt-14 pt-10 grid grid-cols-2 sm:grid-cols-4 gap-6"
            style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}>
            {[
              { value: "500+", label: "Events Catered" },
              { value: "12+", label: "Years of Legacy" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "40+", label: "Awadhi Specialties" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="usp-font font-light" style={{ fontSize: "2.2rem", color: "#d4af37", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div className="usp-body text-xs mt-1 text-white/35 tracking-widest uppercase"
                  style={{ letterSpacing: "0.15em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </section>
    </>
  );
}