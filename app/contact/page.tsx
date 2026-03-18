"use client";

import USPs from "@/components/USPs";
import MenuPreview from "@/components/MenuPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import ContactPage from "@/components/Contact";

export default function Page() {
  return (
    <>

      <ScrollReveal />

      {/* ── Contact / Hero ── */}
      <div className="page-section-1">
        <ContactPage />
      </div>

      <div className="section-divider" />

      {/* ── USPs ── */}
      <div className="page-section-hidden delay-1" data-reveal>
        <USPs />
      </div>

      <div className="section-divider" />

      {/* ── Menu Preview ── */}
      <div className="page-section-hidden delay-2" data-reveal>
        <MenuPreview />
      </div>

      <div className="section-divider" />

      {/* ── Testimonials ── */}
      <div className="page-section-hidden delay-3" data-reveal>
        <Testimonials />
      </div>

      <div className="section-divider" />

      {/* ── CTA ── */}
      <div className="page-section-hidden delay-4" data-reveal>
        <CTA />
      </div>
    </>
  );
}

/* Tiny inline component that wires up IntersectionObserver */
function ScrollReveal() {
  if (typeof window === "undefined") return null;

  const init = () => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("page-section-hidden");
            entry.target.classList.add("page-section-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  };

  // Run after mount
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      requestAnimationFrame(init);
    }
  }

  return null;
}