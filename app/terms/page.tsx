"use client";

import React from "react";

const sections = [
  {
    title: "Introduction",
    content: (
      <p>
        Welcome to <span style={{ color: "#d4af37" }}>AV Food Factory</span> ("Company," "we," "our," or "us").
        These Terms & Conditions govern your use of our website{" "}
        <a href="https://www.avfoodfactory.com" className="tm-link">www.avfoodfactory.com</a>{" "}
        and our catering services in Lucknow. By booking our services or using our website, you agree
        to be bound by these Terms.
      </p>
    ),
  },
  {
    title: "Services",
    content: (
      <p>
        AV Food Factory provides food catering for personal, corporate, and special events. Menu
        selections, availability, and pricing may vary depending on the season, event type, and order size.
      </p>
    ),
  },
  {
    title: "Bookings & Payments",
    content: (
      <ul className="tm-list">
        <li>Bookings must be confirmed at least <span className="tm-strong">48 hours</span> in advance unless otherwise agreed.</li>
        <li>Advance payment or deposit may be required to secure your booking.</li>
        <li>Full payment must be made before or on the day of service, unless prior arrangements are agreed upon.</li>
        <li>Accepted payment methods include UPI, bank transfer, and cash (details provided at the time of booking).</li>
      </ul>
    ),
  },
  {
    title: "Cancellations & Refunds",
    content: (
      <ul className="tm-list">
        <li>Cancellations made more than <span className="tm-strong">24 hours</span> before the event may be eligible for a partial refund (excluding advance booking fees).</li>
        <li>Cancellations made less than 24 hours before the event are non-refundable.</li>
        <li>In case of unforeseen circumstances (e.g., natural disasters, government restrictions), we will work with you to reschedule or provide an appropriate solution.</li>
      </ul>
    ),
  },
  {
    title: "Customer Responsibilities",
    content: (
      <ul className="tm-list">
        <li>Provide accurate event details, including date, time, location, and number of guests.</li>
        <li>Inform us of any food allergies or dietary restrictions at the time of booking.</li>
        <li>Ensure suitable arrangements at the venue for food setup, serving, and cleanup.</li>
      </ul>
    ),
  },
  {
    title: "Liability",
    content: (
      <>
        <p className="mb-4">While we take all reasonable precautions to ensure food safety and quality, AV Food Factory is not liable for:</p>
        <ul className="tm-list">
          <li>Reactions due to undisclosed allergies or dietary restrictions.</li>
          <li>Delays or service interruptions caused by factors beyond our control (traffic, weather, strikes, etc.).</li>
          <li>Damages or losses resulting from the actions of guests or third parties at your event.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Intellectual Property",
    content: (
      <p>
        All content on{" "}
        <a href="https://www.avfoodfactory.com" className="tm-link">www.avfoodfactory.com</a>
        {" "}including text, images, and branding, is the property of AV Food Factory. You may not
        reproduce or distribute this content without written permission.
      </p>
    ),
  },
  {
    title: "Changes to Terms",
    content: (
      <p>
        We reserve the right to update or modify these Terms & Conditions at any time. Updated terms
        will be posted on this page, and continued use of our services indicates your acceptance.
      </p>
    ),
  },
  {
    title: "Governing Law",
    content: (
      <p>
        These Terms & Conditions are governed by the laws of India, and any disputes will be subject
        to the jurisdiction of the courts in Lucknow, Uttar Pradesh.
      </p>
    ),
  },
  {
    title: "Contact Us",
    content: (
      <>
        <p className="mb-5">For any questions or concerns about these Terms & Conditions, please contact us:</p>
        <div className="tm-contact-block">
          <div className="absolute top-0 left-0 w-8 h-8"
            style={{ borderTop: "1px solid rgba(212,175,55,0.35)", borderLeft: "1px solid rgba(212,175,55,0.35)" }} />
          <div className="absolute bottom-0 right-0 w-8 h-8"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.35)", borderRight: "1px solid rgba(212,175,55,0.35)" }} />
          <p className="tm-strong mb-3" style={{ fontSize: "1rem" }}>AV Food Factory</p>
          <p><a href="mailto:support@avfoodfactory.com" className="tm-link">support@avfoodfactory.com</a></p>
          <p><a href="tel:+917880561870" className="tm-link">+91 78805 61870</a></p>
          <p className="mt-2" style={{ color: "rgba(255,255,255,0.32)", lineHeight: 1.8 }}>
            First Floor, Priyadarshini Apartment, 05,<br />
            Wazir Hasan Road, Hazratganj,<br />
            Lucknow, Uttar Pradesh – 226001
          </p>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="relative min-h-screen" style={{ background: "#0d0c0b" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: "600px", height: "240px", background: "radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-3xl px-6 sm:px-10"
          style={{ paddingTop: "8rem", paddingBottom: "6rem" }}>

          {/* ── Header ── */}
          <div className="text-center mb-14">
            <div className="tm-line mx-auto mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

            <h1 className="tm-font tm-heading font-light text-white"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
              Terms & <span className="italic">Conditions</span>
            </h1>

            <p className="tm-meta tm-body mt-4 text-xs text-white/25 tracking-widest uppercase"
              style={{ letterSpacing: "0.2em" }}>
              Effective Date — {new Date().getFullYear()} &nbsp;·&nbsp; AV Food Factory, Lucknow
            </p>

            {/* Ornament */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-10" style={{ background: "rgba(212,175,55,0.15)" }} />
              <svg width="7" height="7" viewBox="0 0 10 10" fill="#d4af37" style={{ opacity: 0.4 }}>
                <path d="M5 0.5L6.2 4H9.5L6.8 6L7.8 9.5L5 7.5L2.2 9.5L3.2 6L0.5 4H3.8L5 0.5Z" />
              </svg>
              <div className="h-px w-10" style={{ background: "rgba(212,175,55,0.15)" }} />
            </div>
          </div>

          {/* ── Content card ── */}
          <div
            className="tm-card relative"
            style={{
              border: "1px solid rgba(212,175,55,0.1)",
              background: "rgba(255,255,255,0.015)",
              padding: "2.5rem",
            }}
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-9 h-9 pointer-events-none"
              style={{ borderTop: "1px solid rgba(212,175,55,0.35)", borderLeft: "1px solid rgba(212,175,55,0.35)" }} />
            <div className="absolute bottom-0 right-0 w-9 h-9 pointer-events-none"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.35)", borderRight: "1px solid rgba(212,175,55,0.35)" }} />

            {sections.map((section, i) => (
              <div key={section.title} className="tm-section">
                <h2 className="tm-section-title">
                  <span className="tm-section-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-shrink-0"
                    style={{ width: "1rem", background: "rgba(212,175,55,0.25)" }} />
                  {section.title}
                </h2>
                <div style={{ paddingLeft: "2.5rem" }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-10 text-center">
            <a href="/"
              className="tm-body inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors duration-200"
              style={{ letterSpacing: "0.15em" }}>
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <path d="M14 4H2M6 1L2 4l4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </a>
          </div>

        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)" }} />
      </div>
    </>
  );
}