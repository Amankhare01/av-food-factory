"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Services",  href: "/#services" },
  { label: "Menu",      href: "/#menu" },
  { label: "Gallery",   href: "/gallery" },
  { label: "About",     href: "/#about" },
  { label: "Contact",   href: "/#contact" },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        }}
      >
        <div
          className="flex items-center justify-between px-6 sm:px-12 lg:px-20"
          style={{ height: scrolled ? "64px" : "80px", transition: "height 0.4s ease" }}
        >
          {/* Logo */}
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="relative w-[130px] h-[45px] sm:w-[160px] sm:h-[55px] md:w-[180px] md:h-[60px]">
              <Image src="/AV-Logo.svg" alt="AV Food Factory Logo" fill className="object-contain" priority />
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveLink(item.label)}
                className={`nav-link ${activeLink === item.label ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 1h3l1 3-1.5 1a7 7 0 003.5 3.5L9.5 7l3 1v3a1 1 0 01-1 1A10 10 0 011 2a1 1 0 011-1z" fill="#d4af37" />
              </svg>
              <a href="tel:+918881904094" className="link-font text-xs tracking-wider text-white/90 hover:text-white transition-colors duration-200">
                +91 88819 04094
              </a>
            </div>
            <div className="hidden lg:block w-px h-5" style={{ background: "rgba(212,175,55,0.2)" }} />
            <Link href="/contact" className="book-btn hidden sm:block link-font text-xs tracking-[0.18em] uppercase border px-5 py-2.5"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "rgba(255,255,255,0.75)" }}>
              <span>Book Now</span>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 relative z-[110]"
              aria-label="Toggle menu"
            >
              <span className="hamburger-line w-6" style={{ transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none", background: menuOpen ? "#d4af37" : "rgba(255,255,255,0.8)" }} />
              <span className="hamburger-line" style={{ width: menuOpen ? "0" : "16px", opacity: menuOpen ? 0 : 1, marginLeft: "auto" }} />
              <span className="hamburger-line w-6" style={{ transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none", background: menuOpen ? "#d4af37" : "rgba(255,255,255,0.8)" }} />
            </button>
          </div>
        </div>

        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4) 30%, rgba(212,175,55,0.4) 70%, transparent)" }} />
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu fixed inset-0 z-[99] md:hidden flex flex-col"
          style={{ background: "rgba(13,12,11,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, #d4af37 40%, #d4af37 60%, transparent)" }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="200" cy="200" r="160" stroke="#d4af37" strokeWidth="0.5" />
              <circle cx="200" cy="200" r="100" stroke="#d4af37" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="flex flex-col justify-center h-full px-10 pb-10">
            <div className="mb-12">
              <div className="relative w-[140px] h-[48px]">
                
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => { setActiveLink(item.label); setMenuOpen(false); }}
                  className="mobile-item group flex items-center gap-4 py-4 border-b link-font"
                  style={{ borderColor: "rgba(212,175,55,0.1)", animationDelay: `${i * 0.07 + 0.1}s`, textDecoration: "none" }}
                >
                  <span className="link-font text-xs" style={{ color: "rgba(212,175,55,0.4)", minWidth: "1.5rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl font-light tracking-wide text-white/80 group-hover:text-white transition-colors nav-font italic">
                    {item.label}
                  </span>
                  <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <path d="M0 4h14M10 1l4 3-4 3" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </nav>
            <Link href="/contact" onClick={() => setMenuOpen(false)}
              className="mobile-item link-font text-sm tracking-[0.18em] uppercase py-4 text-center mt-10"
              style={{ background: "linear-gradient(135deg, #d4af37, #b8922a)", color: "#0d0c0b", fontWeight: 500, animationDelay: `${navLinks.length * 0.07 + 0.15}s`, boxShadow: "0 8px 32px rgba(212,175,55,0.25)", textDecoration: "none" }}>
              Reserve Your Event
            </Link>
<p
  className="mobile-item mt-6 link-font text-xs tracking-widest text-white/30 text-center flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2"
  style={{ animationDelay: `${navLinks.length * 0.07 + 0.25}s` }}
>
  <a
    href="tel:+918881904094"
    className="hover:text-white transition break-all"
  >
    +91 88819 04094
  </a>

  <span className="hidden sm:inline">&nbsp;·&nbsp;</span>

  <a
    href="mailto:support@avfoodfactory.com"
    className="hover:text-white transition break-all"
  >
    support@avfoodfactory.com
  </a>
</p>
          </div>
        </div>
      )}
    </>
  );
}