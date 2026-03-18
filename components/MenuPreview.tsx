"use client";

import Image from "next/image";
import { useState } from "react";

const services = [
  {
    name: "Wedding Catering",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
    tag: "Grand Occasions",
    desc: "Lavish buffets, live counters, and curated Nawabi feasts that make your wedding unforgettable.",
    number: "01",
  },
  {
    name: "Birthday Celebrations",
    img: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop",
    tag: "Joyful Moments",
    desc: "Delicious spreads, fun themes, and a menu designed to add more flavor to your special day.",
    number: "02",
  },
  {
    name: "Corporate & Party Events",
    img: "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?w=800&auto=format&fit=crop&q=80",
    tag: "Professional Touch",
    desc: "Perfectly organized catering for office gatherings, parties, and formal celebrations.",
    number: "03",
  },
  {
    name: "Home Functions & Festive Feasts",
    img: "https://images.unsplash.com/photo-1645886702063-802aa1763ab4?w=800&auto=format&fit=crop&q=80",
    tag: "Family Celebrations",
    desc: "Authentic home-style dishes and Nawabi indulgence for family gatherings and cultural festivities.",
    number: "04",
  },
  {
    name: "Outdoor & Live Counters",
    img: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&auto=format&fit=crop&q=80",
    tag: "Signature Experience",
    desc: "From kebab stations to chaat corners, our live food counters bring aroma and excitement to your event.",
    number: "05",
  },
  {
    name: "Desserts & Sweets Table",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop",
    tag: "Sweet Endings",
    desc: "Indulge in classic Shahi Tukda, Phirni, or Gulab Jamun — handcrafted desserts to complete every meal.",
    number: "06",
  },
];

export default function ServicesPreview() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        .svc-font { font-family: 'Cormorant Garamond', serif; }
        .svc-body { font-family: 'Jost', sans-serif; }

        @keyframes svcFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes svcLineGrow {
          from { width: 0; }
          to   { width: 2.5rem; }
        }

        .svc-heading { animation: svcFadeUp 0.7s ease 0.1s both; }
        .svc-line    { animation: svcLineGrow 0.6s ease 0.3s both; }
        .svc-sub     { animation: svcFadeUp 0.7s ease 0.4s both; }

        .svc-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.1);
          background: rgba(255,255,255,0.02);
          transition: border-color 0.4s ease, transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease;
        }
        .svc-card:hover {
          border-color: rgba(212,175,55,0.35);
          transform: translateY(-5px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.12);
        }

        .svc-img {
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .svc-card:hover .svc-img {
          transform: scale(1.07);
        }

        .svc-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13,12,11,0.85) 0%, rgba(13,12,11,0.2) 55%, transparent 100%);
          transition: opacity 0.4s ease;
        }
        .svc-card:hover .svc-overlay {
          opacity: 0.9;
        }

        .svc-tag-line {
          display: block;
          height: 1px;
          background: #d4af37;
          width: 0;
          transition: width 0.4s ease 0.1s;
        }
        .svc-card:hover .svc-tag-line {
          width: 1.5rem;
        }

        .svc-corner-tl,
        .svc-corner-br {
          position: absolute;
          width: 40px;
          height: 40px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .svc-corner-tl {
          top: 12px; left: 12px;
          border-top: 1px solid rgba(212,175,55,0.5);
          border-left: 1px solid rgba(212,175,55,0.5);
        }
        .svc-corner-br {
          bottom: 12px; right: 12px;
          border-bottom: 1px solid rgba(212,175,55,0.5);
          border-right: 1px solid rgba(212,175,55,0.5);
        }
        .svc-card:hover .svc-corner-tl,
        .svc-card:hover .svc-corner-br {
          opacity: 1;
        }

        .svc-cta-btn {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.35);
          color: rgba(255,255,255,0.7);
          transition: color 0.35s ease, border-color 0.35s ease;
        }
        .svc-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #d4af37, #b8922a);
          transform: translateX(-101%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .svc-cta-btn:hover::before { transform: translateX(0); }
        .svc-cta-btn:hover { color: #0d0c0b; border-color: transparent; }
        .svc-cta-btn span { position: relative; z-index: 1; }
      `}</style>

      <section
        id="menu"
        className="relative"
        style={{ background: "#0d0c0b", padding: "7rem 0" }}
      >
        {/* Top rule */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">

          {/* ── Section Header ── */}
          <div className="mb-14">
            <div className="svc-line mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <h2 className="svc-font svc-heading font-light text-white leading-none"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.01em" }}>
                Catering crafted for{" "}
                <span className="italic">every celebration</span>
              </h2>

              <a
                href="#cta"
                className="svc-sub svc-cta-btn svc-body hidden sm:inline-flex items-center gap-3 px-7 py-3 text-xs tracking-widest uppercase self-end"
                style={{ letterSpacing: "0.18em", whiteSpace: "nowrap" }}
              >
                <span>Get a Quote</span>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" style={{ position: "relative", zIndex: 1 }}>
                  <path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Cards Grid ── */}
          <div className="grid md:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <figure
                key={service.name}
                className="svc-card group"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Corner accents */}
                <div className="svc-corner-tl" />
                <div className="svc-corner-br" />

                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: "240px" }}>
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    className="svc-img object-cover"
                    style={{ filter: "brightness(0.75)" }}
                  />
                  <div className="svc-overlay" />

                  {/* Number badge */}
                  <div className="absolute top-4 left-4 z-10 svc-body text-xs"
                    style={{ color: "rgba(212,175,55,0.5)", letterSpacing: "0.2em" }}>
                    {service.number}
                  </div>

                  {/* Tag overlaid on image bottom */}
                  <div className="absolute bottom-4 left-5 z-10 flex items-center gap-2">
                    <span className="svc-tag-line" />
                    <span className="svc-body text-xs tracking-widest uppercase"
                      style={{ color: "#d4af37", letterSpacing: "0.2em" }}>
                      {service.tag}
                    </span>
                  </div>
                </div>

                {/* Caption */}
                <figcaption className="p-6">
                  <h3 className="svc-font font-light text-white mb-3"
                    style={{ fontSize: "1.35rem", letterSpacing: "0.01em" }}>
                    {service.name}
                  </h3>

                  {/* Gold rule */}
                  <div className="mb-3 h-px transition-all duration-500"
                    style={{
                      width: hovered === i ? "2rem" : "0.75rem",
                      background: "#d4af37",
                      opacity: hovered === i ? 0.8 : 0.3,
                    }} />

                  <p className="svc-body font-light text-sm leading-relaxed text-white/45"
                    style={{ letterSpacing: "0.02em" }}>
                    {service.desc}
                  </p>

                  {/* Hover link */}
                  <div className="mt-5 flex items-center gap-2 transition-all duration-300"
                    style={{
                      opacity: hovered === i ? 1 : 0,
                      transform: hovered === i ? "translateX(0)" : "translateX(-8px)",
                    }}>
                    <span className="svc-body text-xs tracking-widest uppercase"
                      style={{ color: "#d4af37", letterSpacing: "0.18em" }}>
                      Explore
                    </span>
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path d="M0 4h14M10 1l4 3-4 3" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-10 sm:hidden text-center">
            <a
              href="#cta"
              className="svc-cta-btn svc-body inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-widest uppercase"
              style={{ letterSpacing: "0.18em" }}
            >
              <span>Get a Quote</span>
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none" style={{ position: "relative", zIndex: 1 }}>
                <path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </section>
    </>
  );
}