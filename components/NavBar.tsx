"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = ["Services", "Menu", "Gallery", "About", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>

      <header
        className="navbar-animate fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(13,12,11,0.92)"
            : "linear-gradient(to bottom, rgba(13,12,11,0.75), transparent)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.12)" : "none",
          padding: scrolled ? "0" : "0",
        }}
      >
        <div className="flex items-center justify-between px-6 sm:px-12 lg:px-20"
          style={{ height: scrolled ? "64px" : "80px", transition: "height 0.4s ease" }}>

          {/* ── Logo ── */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="relative w-[130px] h-[45px] sm:w-[160px] sm:h-[55px] md:w-[180px] md:h-[60px]">
            <Image
              src="/AV-Logo.svg"
              alt="AV Food Factory Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

          {/* ── Desktop Links ── */}
          <nav className="hidden md:flex items-center gap-9 link-font">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setActiveLink(item)}
                className={`nav-link text-xs tracking-[0.18em] uppercase ${activeLink === item ? "active" : ""}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-4">
            {/* Phone number (desktop) */}
            <div className="hidden lg:flex items-center gap-2 link-font">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 1h3l1 3-1.5 1a7 7 0 003.5 3.5L9.5 7l3 1v3a1 1 0 01-1 1A10 10 0 011 2a1 1 0 011-1z"
                  fill="#d4af37" />
              </svg>
              <a
  href="tel:+918881904094"
  className="hover:text-white transition"
>
  <span className="text-white/40 text-xs tracking-wider">
    +91 88819 04094
  </span>
</a>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5" style={{ background: "rgba(212,175,55,0.2)" }} />

            {/* Book Now button */}
            <Link href={"/contact"} className="book-btn hidden sm:block link-font text-xs tracking-[0.18em] uppercase border px-5 py-2.5"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "rgba(255,255,255,0.75)" }}>
              <span>Book Now</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 relative z-[110]"
              aria-label="Toggle menu"
            >
              <span className="hamburger-line w-6" style={{
                transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
                background: menuOpen ? "#d4af37" : "rgba(255,255,255,0.8)",
              }} />
              <span className="hamburger-line" style={{
                width: menuOpen ? "0" : "16px",
                opacity: menuOpen ? 0 : 1,
                marginLeft: "auto",
              }} />
              <span className="hamburger-line w-6" style={{
                transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
                background: menuOpen ? "#d4af37" : "rgba(255,255,255,0.8)",
              }} />
            </button>
          </div>
        </div>

        {/* ── Slim gold accent line at bottom ── */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4) 30%, rgba(212,175,55,0.4) 70%, transparent)" }} />
        )}
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      {menuOpen && (
        <div className="mobile-menu fixed inset-0 z-[99] md:hidden flex flex-col"
          style={{ background: "rgba(13,12,11,0.97)", backdropFilter: "blur(20px)" }}>

          {/* Top ornament */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, #d4af37 40%, #d4af37 60%, transparent)" }} />

          {/* Decorative corner */}
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="200" cy="200" r="160" stroke="#d4af37" strokeWidth="0.5" />
              <circle cx="200" cy="200" r="100" stroke="#d4af37" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="flex flex-col justify-center h-full px-10 pb-10">
            {/* Brand in mobile menu */}
            <div className="nav-font font-light mb-12" style={{ fontSize: "2.2rem", letterSpacing: "0.04em" }}>
              <span className="logo-text">La</span>
              <span className="italic text-white/90">Maison</span>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1">
              {navLinks.map((item, i) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => { setActiveLink(item); setMenuOpen(false); }}
                  className="mobile-item group flex items-center gap-4 py-4 border-b link-font"
                  style={{
                    borderColor: "rgba(212,175,55,0.1)",
                    animationDelay: `${i * 0.07 + 0.1}s`,
                  }}
                >
                  <span className="text-xs link-font" style={{ color: "rgba(212,175,55,0.4)", minWidth: "1.5rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl font-light tracking-wide text-white/80 group-hover:text-white transition-colors nav-font italic">
                    {item}
                  </span>
                  <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <path d="M0 4h14M10 1l4 3-4 3" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </nav>

            {/* CTA */}
            <Link
            href={"/contact"}
              className="mt-10 mobile-item link-font text-sm tracking-[0.18em] uppercase py-4 text-center"
              style={{
                background: "linear-gradient(135deg, #d4af37, #b8922a)",
                color: "#0d0c0b",
                fontWeight: 500,
                animationDelay: `${navLinks.length * 0.07 + 0.15}s`,
                boxShadow: "0 8px 32px rgba(212,175,55,0.25)",
              }}
            >
              Reserve Your Event
            </Link>

            {/* Contact info */}
<p
  className="mobile-item mt-6 link-font text-xs tracking-widest text-white/30 text-center"
  style={{ animationDelay: `${navLinks.length * 0.07 + 0.25}s` }}
>
  <a href="tel:+918881904094" className="hover:text-white transition">
    +91 88819 04094
  </a>
  &nbsp;·&nbsp;
  <a href="mailto:support@avfoodfactory.com" className="hover:text-white transition">
    support@avfoodfactory.com
  </a>
</p>
          </div>
        </div>
      )}
    </>
  );
}