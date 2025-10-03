'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-white/70 border-b border-black/5">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-nawab-emerald grid place-content-center text-white font-bold group-hover:drop-shadow-glow transition">
            AV
          </span>
          <span className="font-heading text-xl tracking-wide">AV Food Factory</span>
        </Link>

        <button
          className="md:hidden p-2 rounded hover:bg-black/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li><a href="#menu" className="hover:text-nawab-emerald">Menu</a></li>
          <li><a href="#services" className="hover:text-nawab-emerald">Services</a></li>
          <li><a href="#testimonials" className="hover:text-nawab-emerald">Reviews</a></li>
          <li><a href="#contact" className="hover:text-nawab-emerald">Contact</a></li>
          <li>
            <a
              href="#cta"
              className="inline-flex items-center rounded-full bg-nawab-emerald px-4 py-2 text-white hover:bg-nawab-emeraldDeep transition"
            >
              Get a Quote
            </a>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <ul className="px-4 py-3 space-y-3">
            <li><a onClick={() => setOpen(false)} href="#menu">Menu</a></li>
            <li><a onClick={() => setOpen(false)} href="#services">Services</a></li>
            <li><a onClick={() => setOpen(false)} href="#testimonials">Reviews</a></li>
            <li><a onClick={() => setOpen(false)} href="#contact">Contact</a></li>
            <li>
              <a
                onClick={() => setOpen(false)}
                href="#cta"
                className="inline-flex items-center rounded-full bg-nawab-emerald px-4 py-2 text-white"
              >
                Get a Quote
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
