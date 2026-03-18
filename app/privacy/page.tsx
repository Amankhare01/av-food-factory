"use client";

import React from "react";

const sections = [
  {
    title: "Introduction",
    content: (
      <p>
        Welcome to <span style={{ color: "#d4af37" }}>AV Food Factory</span> ("we," "our," or "us"). At AV Food Factory,
        accessible at{" "}
        <a href="https://www.avfoodfactory.com" className="pp-link">
          www.avfoodfactory.com
        </a>
        , we value your trust and are committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, and safeguard your information when you use our catering
        services in Lucknow.
      </p>
    ),
  },
  {
    title: "Information We Collect",
    content: (
      <ul className="pp-list">
        <li><span className="pp-strong">Personal Information:</span> Name, email address, phone number, billing and delivery address, and event details.</li>
        <li><span className="pp-strong">Order Information:</span> Food preferences, menu selections, dietary requirements, and booking details.</li>
        <li><span className="pp-strong">Technical Information:</span> IP address, browser type, and cookies to improve user experience.</li>
      </ul>
    ),
  },
  {
    title: "How We Use Your Information",
    content: (
      <ul className="pp-list">
        <li>To process and deliver catering orders efficiently.</li>
        <li>To communicate with you regarding bookings, changes, or updates.</li>
        <li>To provide customer support and address inquiries.</li>
        <li>To improve our website, menu options, and overall service experience.</li>
        <li>To comply with legal obligations and prevent fraudulent activities.</li>
      </ul>
    ),
  },
  {
    title: "Sharing of Information",
    content: (
      <>
        <p className="mb-4">We do not sell or rent your personal data to third parties. We may share information with:</p>
        <ul className="pp-list">
          <li><span className="pp-strong">Service Providers:</span> Trusted vendors helping us with deliveries, payments, or IT support.</li>
          <li><span className="pp-strong">Legal Authorities:</span> When required by law or to protect our rights and safety.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Cookies & Tracking",
    content: (
      <p>
        Our website may use cookies to enhance your browsing experience, analyze traffic, and personalize
        services. You can disable cookies in your browser settings, but some features may not function
        properly without them.
      </p>
    ),
  },
  {
    title: "Data Security",
    content: (
      <p>
        We implement industry-standard security measures to protect your information. However, no online
        transmission is 100% secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    title: "Your Rights",
    content: (
      <>
        <p className="mb-4">You have the right to:</p>
        <ul className="pp-list">
          <li>Request access to your personal information.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Opt out of promotional communications at any time.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Third-Party Links",
    content: (
      <p>
        Our website may contain links to third-party sites. We are not responsible for the privacy
        practices or content of those sites and encourage you to review their privacy policies.
      </p>
    ),
  },
  {
    title: "Policy Updates",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page
        with an updated "Effective Date." We encourage you to review it periodically.
      </p>
    ),
  },
  {
    title: "Contact Us",
    content: (
      <>
        <p className="mb-5">If you have questions or concerns about this Privacy Policy, please reach out:</p>
        <div className="pp-contact-block">
          <div className="absolute top-0 left-0 w-8 h-8"
            style={{ borderTop: "1px solid rgba(212,175,55,0.35)", borderLeft: "1px solid rgba(212,175,55,0.35)" }} />
          <div className="absolute bottom-0 right-0 w-8 h-8"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.35)", borderRight: "1px solid rgba(212,175,55,0.35)" }} />
          <p className="pp-strong mb-3" style={{ fontSize: "1rem" }}>AV Food Factory</p>
          <p>
            <a href="mailto:support@avfoodfactory.com" className="pp-link">support@avfoodfactory.com</a>
          </p>
          <p>
            <a href="tel:+917880561870" className="pp-link">+91 78805 61870</a>
          </p>
          <p className="mt-2 text-white/35" style={{ lineHeight: 1.8 }}>
            First Floor, Priyadarshini Apartment, 05,<br />
            Wazir Hasan Road, Hazratganj,<br />
            Lucknow, Uttar Pradesh – 226001
          </p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <>

      <div
        className="relative min-h-screen"
        style={{ background: "#0d0c0b" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: "600px", height: "240px", background: "radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-3xl px-6 sm:px-10"
          style={{ paddingTop: "8rem", paddingBottom: "6rem" }}>

          {/* ── Header ── */}
          <div className="text-center mb-14">
            <div className="pp-line mx-auto mb-5 h-px"
              style={{ width: "2.5rem", background: "rgba(212,175,55,0.5)" }} />

            <h1 className="pp-font pp-heading font-light text-white"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
              Privacy <span className="italic">Policy</span>
            </h1>

            <p className="pp-meta pp-body mt-4 text-xs text-white/25 tracking-widest uppercase"
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
            className="pp-body-wrap relative"
            style={{
              border: "1px solid rgba(212,175,55,0.1)",
              background: "rgba(255,255,255,0.015)",
              padding: "2.5rem 2.5rem",
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-9 h-9 pointer-events-none"
              style={{ borderTop: "1px solid rgba(212,175,55,0.35)", borderLeft: "1px solid rgba(212,175,55,0.35)" }} />
            <div className="absolute bottom-0 right-0 w-9 h-9 pointer-events-none"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.35)", borderRight: "1px solid rgba(212,175,55,0.35)" }} />

            {sections.map((section, i) => (
              <div key={section.title} className="pp-section">
                <h2 className="pp-section-title">
                  <span className="pp-section-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-shrink-0" style={{ width: "1rem", background: "rgba(212,175,55,0.25)" }} />
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
            <a href="/" className="pp-body inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors duration-200"
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