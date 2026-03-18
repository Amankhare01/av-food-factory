"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";

const images = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop",
    label: "Artisan Spreads",
    tag: "Signature",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1600&auto=format&fit=crop",
    label: "Festive Table",
    tag: "Occasions",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1600&auto=format&fit=crop",
    label: "Live Counters",
    tag: "Experience",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
    label: "Grand Buffet",
    tag: "Nawabi",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1600&auto=format&fit=crop",
    label: "Curated Plates",
    tag: "Fine Dining",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
    label: "Fresh & Vibrant",
    tag: "Seasonal",
  },
];

export default function GalleryPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Open modal
  function openModal(idx: number) {
    setSelectedIdx(idx);
    setModalVisible(true);
    document.body.style.overflow = "hidden";
  }

  // Close modal
  function closeModal() {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedIdx(null);
      document.body.style.overflow = "";
    }, 300);
  }

  // Mouse-position zoom handler
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  // Reset zoom when image changes
  function navigateTo(idx: number) {
    setZoom(false);
    setSelectedIdx(idx);
  }
  useEffect(() => {
    if (selectedIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") navigateTo((selectedIdx! + 1) % images.length);
      if (e.key === "ArrowLeft")  navigateTo((selectedIdx! - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIdx]);

  const selected = selectedIdx !== null ? images[selectedIdx] : null;

  return (
    <>

      <main style={{ background: "#0d0c0b", minHeight: "100vh" }}>
        <section className="relative overflow-hidden" style={{ paddingTop: "7rem", paddingBottom: "6rem" }}>

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ width: "700px", height: "300px", background: "radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)" }} />

          <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">

            {/* ── Header ── */}
            <div className="mb-16 text-center">
              <div className="gl-line mx-auto mb-5 h-px"
                style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

              <h1 className="gl-font gl-heading font-light text-white"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
                Our <span className="italic">Gallery</span>
              </h1>

              <p className="gl-sub gl-body mt-4 font-light text-white/35 mx-auto"
                style={{ fontSize: "0.95rem", letterSpacing: "0.05em", lineHeight: 1.85, maxWidth: "440px" }}>
                A glimpse into our elegant spreads, signature dishes, and unforgettable Nawabi celebrations.
              </p>

              {/* Gold ornament */}
              <div className="flex items-center justify-center gap-3 mt-5">
                <div className="h-px w-10" style={{ background: "rgba(212,175,55,0.2)" }} />
                <svg width="8" height="8" viewBox="0 0 10 10" fill="#d4af37" style={{ opacity: 0.5 }}>
                  <path d="M5 0.5L6.2 4H9.5L6.8 6L7.8 9.5L5 7.5L2.2 9.5L3.2 6L0.5 4H3.8L5 0.5Z" />
                </svg>
                <div className="gl-body text-xs text-white/25" style={{ letterSpacing: "0.2em" }}>AV FOOD FACTORY</div>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="#d4af37" style={{ opacity: 0.5 }}>
                  <path d="M5 0.5L6.2 4H9.5L6.8 6L7.8 9.5L5 7.5L2.2 9.5L3.2 6L0.5 4H3.8L5 0.5Z" />
                </svg>
                <div className="h-px w-10" style={{ background: "rgba(212,175,55,0.2)" }} />
              </div>
            </div>

            {/* ── Grid ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="gl-card"
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => openModal(idx)}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Corner brackets */}
                  <div className="gl-corner-tl" />
                  <div className="gl-corner-br" />

                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: "280px" }}>
                    <Image
                      src={img.src}
                      alt={img.label}
                      fill
                      className="gl-card-img object-cover"
                      style={{ filter: "brightness(0.8)" }}
                    />
                    <div className="gl-card-overlay" />

                    {/* Tag */}
                    <div className="gl-card-tag">
                      <span className="h-px w-4 block" style={{ background: "#d4af37" }} />
                      <span className="gl-body text-xs uppercase"
                        style={{ color: "#d4af37", letterSpacing: "0.2em" }}>
                        {img.tag}
                      </span>
                    </div>

                    {/* Caption bar */}
                    <div className="gl-card-caption">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="gl-font text-white font-light"
                            style={{ fontSize: "1.2rem", letterSpacing: "0.01em" }}>
                            {img.label}
                          </p>
                          <div className="mt-1 h-px w-6" style={{ background: "rgba(212,175,55,0.5)" }} />
                        </div>
                        <div className="gl-view-btn">
                          View
                          <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                            <path d="M0 3h10M7 1l3 2-3 2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Count strip ── */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-24" style={{ background: "rgba(212,175,55,0.1)" }} />
              <span className="gl-body text-xs text-white/20" style={{ letterSpacing: "0.18em" }}>
                {images.length} MOMENTS CAPTURED
              </span>
              <div className="h-px flex-1 max-w-24" style={{ background: "rgba(212,175,55,0.1)" }} />
            </div>

          </div>
        </section>
      </main>

      {/* ── Modal Lightbox ── */}
      {selected && (
        <div
          className={`gl-modal-overlay ${modalVisible ? "in" : "out"}`}
          onClick={closeModal}
        >
          <div
            className={`gl-modal-inner ${modalVisible ? "in" : "out"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <span className="gl-body text-xs" style={{ color: "#d4af37", letterSpacing: "0.2em" }}>
                  {String(selectedIdx! + 1).padStart(2, "0")}
                </span>
                <span className="gl-body text-xs text-white/30" style={{ letterSpacing: "0.12em" }}>
                  / {String(images.length).padStart(2, "0")}
                </span>
                <div className="h-px w-6" style={{ background: "rgba(212,175,55,0.3)" }} />
                <span className="gl-font text-white/60 italic" style={{ fontSize: "1rem" }}>
                  {selected.label}
                </span>
              </div>

              {/* Close */}
              <button
                onClick={closeModal}
                className="gl-modal-nav"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Image — cursor-tracking zoom */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                height: "min(60vh, 520px)",
                border: "1px solid rgba(212,175,55,0.18)",
                cursor: zoom ? "zoom-out" : "zoom-in",
              }}
              onMouseMove={handleMouseMove}
              onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
              onMouseLeave={() => setZoom(false)}
            >
              {/* The actual image — transform-origin follows cursor */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: zoom ? "scale(2.5)" : "scale(1)",
                  transition: zoom ? "transform 0.15s ease-out" : "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                  willChange: "transform",
                }}
              >
                <Image
                  src={selected.src}
                  alt={selected.label}
                  fill
                  className="object-contain"
                  style={{ filter: "brightness(0.95)", pointerEvents: "none" }}
                  draggable={false}
                />
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none z-10"
                style={{ borderTop: "1px solid rgba(212,175,55,0.45)", borderLeft: "1px solid rgba(212,175,55,0.45)" }} />
              <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none z-10"
                style={{ borderBottom: "1px solid rgba(212,175,55,0.45)", borderRight: "1px solid rgba(212,175,55,0.45)" }} />

              {/* Zoom hint badge — shows only when not zoomed */}
              {!zoom && (
                <div
                  className="absolute bottom-3 right-3 z-10 pointer-events-none flex items-center gap-1.5"
                  style={{
                    background: "rgba(13,12,11,0.7)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    padding: "4px 10px",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.18em",
                    color: "rgba(212,175,55,0.7)",
                    textTransform: "uppercase",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="4.5" cy="4.5" r="3.5" stroke="rgba(212,175,55,0.7)" strokeWidth="1"/>
                    <path d="M7 7l2 2" stroke="rgba(212,175,55,0.7)" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M3 4.5h3M4.5 3v3" stroke="rgba(212,175,55,0.7)" strokeWidth="0.8" strokeLinecap="round"/>
                  </svg>
                  Click to zoom
                </div>
              )}
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-between mt-4 px-1">
              <button
                className="gl-modal-nav"
                onClick={() => navigateTo((selectedIdx! - 1 + images.length) % images.length)}
                aria-label="Previous"
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M14 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => navigateTo(i)}
                    style={{
                      width: i === selectedIdx ? "2rem" : "1rem",
                      height: "2px",
                      borderRadius: "9999px",
                      background: i === selectedIdx ? "#d4af37" : "rgba(255,255,255,0.15)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              <button
                className="gl-modal-nav"
                onClick={() => navigateTo((selectedIdx! + 1) % images.length)}
                aria-label="Next"
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M0 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="gl-body text-center text-xs text-white/15 mt-3"
              style={{ letterSpacing: "0.12em" }}>
              ← → to navigate &nbsp;·&nbsp; ESC to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}