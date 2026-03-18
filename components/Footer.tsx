import Link from "next/link";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <>
      <footer
        id="contact"
        className="relative"
        style={{ background: "#0d0c0b" }}
      >
        {/* Top rule */}
        <div className="ft-divider" />

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(212,175,55,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* ── Main grid ── */}
        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo wordmark */}
            <Link href="/" className="inline-flex items-center gap-2 group mb-5 select-none">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 1L12 7.5H19L13.5 11.5L15.5 18L10 14L4.5 18L6.5 11.5L1 7.5H8L10 1Z"
                  fill="#d4af37" fillOpacity="0.9" />
              </svg>
              <span className="ft-font font-light text-white" style={{ fontSize: "1.5rem", letterSpacing: "0.04em" }}>
                <span style={{
                  background: "linear-gradient(90deg,#d4af37,#f5d980 45%,#b8922a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>AV</span>
                {" "}<span className="italic">Food Factory</span>
              </span>
            </Link>

            <p className="ft-body text-sm leading-relaxed text-white/35 max-w-xs mb-7"
              style={{ letterSpacing: "0.03em" }}>
              Dastarkhwan-style catering rooted in Lucknow's Nawabi hospitality. From grand weddings to cozy family feasts — we bring taste and tradition together.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              <Link href="https://www.facebook.com/avfoodfactory/" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="Facebook">
                <FaFacebook size={14} />
              </Link>
              <Link href="https://www.instagram.com/avfoodfactory/" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="Instagram">
                <FaInstagram size={14} />
              </Link>
              <Link href="https://wa.me/918881904094" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="WhatsApp">
                <FaWhatsapp size={14} />
              </Link>
            </div>
          </div>

          {/* ── Contact ── */}
          <div>
            <div className="mb-1 h-px w-6" style={{ background: "rgba(212,175,55,0.4)" }} />
            <h4 className="ft-font font-light text-white mt-4 mb-6" style={{ fontSize: "1.25rem", letterSpacing: "0.02em" }}>
              Get in <span className="italic">Touch</span>
            </h4>

            <ul className="ft-body space-y-5">
              <li>
                <a href="https://wa.me/918881904094" target="_blank" rel="noopener noreferrer" className="ft-contact-row">
                  <FaWhatsapp size={14} style={{ color: "#d4af37", marginTop: "3px", flexShrink: 0 }} />
                  <span>+91 88819 04094</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@avfoodfactory.com" className="ft-contact-row">
                  <FaEnvelope size={14} style={{ color: "#d4af37", marginTop: "3px", flexShrink: 0 }} />
                  <span>support@avfoodfactory.com</span>
                </a>
              </li>
              <li className="ft-contact-row">
                <FaMapMarkerAlt size={14} style={{ color: "#d4af37", marginTop: "3px", flexShrink: 0 }} />
                <span>
                  First Floor, Priyadarshini Apartment,<br />
                  05 Wazir Hasan Road, Hazratganj,<br />
                  Lucknow, UP 226001
                </span>
              </li>
            </ul>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <div className="mb-1 h-px w-6" style={{ background: "rgba(212,175,55,0.4)" }} />
            <h4 className="ft-font font-light text-white mt-4 mb-6" style={{ fontSize: "1.25rem", letterSpacing: "0.02em" }}>
              Quick <span className="italic">Links</span>
            </h4>

            <ul className="ft-body space-y-4">
              {[
                { label: "Services", href: "#services" },
                { label: "Menu", href: "#menu" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Contact", href: "#contact" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="ft-link text-sm" style={{ letterSpacing: "0.06em" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="ft-divider" />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-3">

          <p className="ft-body text-xs text-white/20" style={{ letterSpacing: "0.12em" }}>
            © {new Date().getFullYear()} AV Food Factory &nbsp;·&nbsp; Lucknow
          </p>

          <p className="ft-body text-xs text-white/20 text-center md:text-right" style={{ letterSpacing: "0.06em" }}>
            Developed by{" "}
            <Link
              href="https://digipants.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-link"
              style={{ color: "rgba(212,175,55,0.55)" }}
            >
              DigiPants Network Pvt.
            </Link>
          </p>

        </div>
      </footer>
    </>
  );
}