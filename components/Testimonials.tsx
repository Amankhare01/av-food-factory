"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Bride",
    event: "Wedding Reception · Hazratganj",
    quote:
      "AV Food Factory turned our wedding into a culinary legend. The Galouti Kebabs melted on the tongue and the Lucknowi Biryani had guests asking for seconds and thirds. Every dish felt like it came straight from the royal kitchens of Nawabs.",
    rating: 5,
    initial: "P",
  },
  {
    id: 2,
    name: "Rajesh Verma",
    role: "Corporate Event Manager",
    event: "Annual Corporate Dinner · Gomti Nagar",
    quote:
      "We've worked with many caterers across Lucknow, but AV Food Factory is in a class of their own. The presentation was immaculate, the live kebab counter was a showstopper, and the service staff were absolutely professional. Our clients were thoroughly impressed.",
    rating: 5,
    initial: "R",
  },
  {
    id: 3,
    name: "Meera & Arjun Tiwari",
    role: "Hosts",
    event: "Walima Celebration · Aliganj",
    quote:
      "From the Sheermal to the Phirni, every bite carried the soul of Awadhi tradition. AV Food Factory handled 300 guests effortlessly — the buffet spread was breathtaking, and their team managed everything with warmth and precision.",
    rating: 5,
    initial: "M",
  },
  {
    id: 4,
    name: "Sandhya Gupta",
    role: "Birthday Host",
    event: "50th Birthday Soirée · Indira Nagar",
    quote:
      "I wanted something truly special for my mother's milestone birthday, and AV Food Factory exceeded every expectation. The dessert table alone drew a crowd. The Shahi Tukda was divine — it was like tasting history in every spoon.",
    rating: 5,
    initial: "S",
  },
  {
    id: 5,
    name: "Farhan Ansari",
    role: "Groom's Family",
    event: "Nikaah Ceremony · Chowk",
    quote:
      "Choosing AV Food Factory for our nikaah was the best decision we made. The Nawabi theme of the buffet perfectly complemented our décor. Guests from Delhi and Hyderabad couldn't stop praising the authenticity of the Lucknowi flavors.",
    rating: 5,
    initial: "F",
  },
];

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="#d4af37">
    <path d="M7 1L8.5 5.5H13.5L9.5 8L11 12.5L7 9.5L3 12.5L4.5 8L0.5 5.5H5.5L7 1Z" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
    <path d="M0 28V17.6C0 12.267 1.333 8.133 4 5.2 6.667 2.267 10.667 0.533 16 0L17.6 3.6C14.667 4.267 12.4 5.6 10.8 7.6 9.2 9.6 8.4 11.867 8.4 14.4H14.4V28H0ZM21.6 28V17.6C21.6 12.267 22.933 8.133 25.6 5.2 28.267 2.267 32.267 0.533 37.6 0L39.2 3.6C36.267 4.267 34 5.6 32.4 7.6 30.8 9.6 30 11.867 30 14.4H36V28H21.6Z"
      fill="#d4af37" fillOpacity="0.12" />
  </svg>
);

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [visible, setVisible] = useState(true);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: "left" | "right" = "right") => {
    if (index === current) return;
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 320);
  }, [current]);

  const next = useCallback(() => {
    goTo((current + 1) % testimonials.length, "right");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + testimonials.length) % testimonials.length, "left");
  }, [current, goTo]);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 5500);
  }, [next]);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  const t = testimonials[current];

  return (
    <>

      <section
        id="testimonials"
        className="relative overflow-hidden"
        style={{ background: "#0d0c0b", padding: "7rem 0" }}
      >
        {/* Top rule */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Large ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: "600px", height: "600px", background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">

          {/* ── Section Header ── */}
          <div className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="tm-line mb-5 h-px"
                style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />
              <h2 className="tm-font tm-heading font-light text-white leading-none"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.01em" }}>
                Voices of <span className="italic">Lucknow</span>
              </h2>
              <p className="tm-body mt-3 text-sm font-light text-white/35 max-w-sm"
                style={{ letterSpacing: "0.04em", lineHeight: 1.8 }}>
                What our guests say about AV Food Factory's Nawabi hospitality.
              </p>
            </div>

            {/* Nav arrows */}
            <div className="flex items-center gap-3 self-end">
              <button className="tm-nav-btn" onClick={() => { prev(); resetAuto(); }} aria-label="Previous">
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M16 5H2M6 1L2 5l4 4" stroke="rgba(212,175,55,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="tm-nav-btn" onClick={() => { next(); resetAuto(); }} aria-label="Next">
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M0 5h14M10 1l4 4-4 4" stroke="rgba(212,175,55,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Main Testimonial Card ── */}
          <div className="tm-card-bg p-8 sm:p-12 relative">

            {/* Decorative corner brackets */}
            <div className="absolute top-0 left-0 w-10 h-10"
              style={{ borderTop: "1px solid rgba(212,175,55,0.4)", borderLeft: "1px solid rgba(212,175,55,0.4)" }} />
            <div className="absolute bottom-0 right-0 w-10 h-10"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.4)", borderRight: "1px solid rgba(212,175,55,0.4)" }} />

            <div
              key={current}
              className={`${visible ? (animDir === "right" ? "tm-enter-right" : "tm-enter-left") : "opacity-0"}`}
            >
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

                {/* Left — avatar + meta */}
                <div className="flex lg:flex-col items-center lg:items-start gap-5 lg:gap-4 lg:min-w-[180px]">
                  {/* Avatar */}
                  <div className="tm-avatar flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: "72px", height: "72px" }}>
                    <span className="tm-font font-light text-white/80"
                      style={{ fontSize: "1.8rem" }}>
                      {t.initial}
                    </span>
                  </div>

                  <div>
                    <div className="tm-font text-white font-light"
                      style={{ fontSize: "1.25rem", letterSpacing: "0.01em" }}>
                      {t.name}
                    </div>
                    <div className="tm-body text-xs mt-1"
                      style={{ color: "#d4af37", letterSpacing: "0.12em" }}>
                      {t.role}
                    </div>
                    <div className="tm-body text-xs mt-1.5 text-white/30"
                      style={{ letterSpacing: "0.06em" }}>
                      {t.event}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — quote */}
                <div className="flex-1 relative">
                  {/* Quote mark */}
                  <div className="absolute -top-2 -left-1">
                    <QuoteIcon />
                  </div>

                  <p className="tm-font font-light text-white/80 leading-relaxed relative z-10"
                    style={{ fontSize: "clamp(1.15rem, 2vw, 1.5rem)", letterSpacing: "0.01em", lineHeight: 1.75 }}>
                    "{t.quote}"
                  </p>

                  {/* Gold rule at bottom */}
                  <div className="mt-8 h-px w-12"
                    style={{ background: "rgba(212,175,55,0.35)" }} />
                </div>

              </div>
            </div>
          </div>

          {/* ── Dots + Counter ── */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(i, i > current ? "right" : "left"); resetAuto(); }}
                  className={`tm-dot ${i === current ? "active" : ""}`}
                  style={{ width: i === current ? "2.5rem" : "1.25rem" }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <div className="tm-body text-xs text-white/25 flex items-baseline gap-1.5"
              style={{ letterSpacing: "0.12em" }}>
              <span style={{ color: "#d4af37", fontSize: "1.1rem" }}>
                {String(current + 1).padStart(2, "0")}
              </span>
              <span>/ {String(testimonials.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* ── Location Badge ── */}
          <div className="mt-14 flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "rgba(212,175,55,0.15)" }} />
            <div className="tm-body flex items-center gap-2 text-xs text-white/30"
              style={{ letterSpacing: "0.18em" }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M5 0C3 0 1 1.8 1 4c0 3 4 8 4 8s4-5 4-8c0-2.2-2-4-4-4z"
                  fill="rgba(212,175,55,0.4)" />
                <circle cx="5" cy="4" r="1.5" fill="rgba(212,175,55,0.7)" />
              </svg>
              AV FOOD FACTORY · LUCKNOW
            </div>
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "rgba(212,175,55,0.15)" }} />
          </div>

        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </section>
    </>
  );
}