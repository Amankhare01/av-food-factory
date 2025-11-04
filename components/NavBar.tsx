"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-white/80 border-b border-black/5">
      <nav className="mx-auto max-w-7xl px-2 md:px-6 py-1 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="relative w-[130px] h-[45px] sm:w-[160px] sm:h-[55px] md:w-[180px] md:h-[60px]">
            <Image
              src="/logo.svg"
              alt="AV Food Factory Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-black/5 text-2xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* DESKTOP LINKS */}
        <ul className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-700">
            <li>
              <a onClick={() => setOpen(false)} href="#menu" className="block hover:text-[#0f766e]">
                Menu
              </a>
            </li>
            <li>
              <a onClick={() => setOpen(false)} href="#services" className="block hover:text-[#0f766e]">
                Services
              </a>
            </li>
            <li>
              <a onClick={() => setOpen(false)} href="#testimonials" className="block hover:text-[#0f766e]">
                Reviews
              </a>
            </li>
          <li>
            <a href="#cta" className="hover:text-[#0f766e] transition-colors">
              Contact
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="inline-flex items-center rounded-full bg-[#0f766e] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#115e59] transition-all"
            >
              Get a Quote
            </a>
          </li>
        </ul>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <ul className="px-4 py-4 space-y-4 text-[15px] font-medium text-gray-800">
            <li>
              <a onClick={() => setOpen(false)} href="#menu" className="block hover:text-[#0f766e]">
                Menu
              </a>
            </li>
            <li>
              <a onClick={() => setOpen(false)} href="#services" className="block hover:text-[#0f766e]">
                Services
              </a>
            </li>
            <li>
              <a onClick={() => setOpen(false)} href="#testimonials" className="block hover:text-[#0f766e]">
                Reviews
              </a>
            </li>
            <li>
              <a onClick={() => setOpen(false)} href="#cta" className="block hover:text-[#0f766e]">
                Contact
              </a>
            </li>
            <li>
              <a
                onClick={() => setOpen(false)}
                href="/contact"
                className="inline-flex items-center justify-center w-full rounded-full bg-[#0f766e] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#115e59] transition-all"
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
