import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/5 bg-[#faf6f1]">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-6 py-14 grid sm:grid-cols-2 md:grid-cols-3 gap-10">
        {/* Brand Info */}
        <div>
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="relative w-[140px] h-[50px] sm:w-[160px] sm:h-[60px]">
              <Image
                src="/logo.svg"
                alt="AV Food Factory Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <p className="text-sm text-black/70 mt-3 leading-relaxed max-w-xs">
            Dastarkhwan-style catering rooted in Lucknow’s Nawabi hospitality.
            From grand weddings to cozy family feasts — we bring taste and tradition together.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="https://www.facebook.com/avfoodfactory/" className="hover:text-green-900 text-"><FaFacebook size={22} /></Link>
            <Link href="https://www.instagram.com/avfoodfactory/" className="hover:text-green-900"><FaInstagram size={22} /></Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-[#0f766e]">Contact Us</h4>
          <ul className="text-sm text-black/70 space-y-3">
            <li className="flex items-center gap-3">
              <FaWhatsapp className="text-[#25D366] text-lg" />
              <a
                href="https://wa.me/917880561870"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0f766e] transition-colors"
              >
                +91 788 056 1870
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-[#0f766e] text-lg" />
              <a
                href="mailto:support@avfoodfactory.com"
                className="hover:text-[#0f766e] transition-colors"
              >
                support@avfoodfactory.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#0f766e] text-lg mt-1" />
              <span className="leading-relaxed">
                First Floor, Priyadarshini Apartment, 05, Wazir Hasan Road,
                Hazratganj, Lucknow, Uttar Pradesh 226001
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-[#0f766e]">Quick Links</h4>
          <ul className="text-sm text-black/70 space-y-3">
            <li>
              <Link href="#services" className="hover:text-[#0f766e] transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-[#0f766e] transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#0f766e] transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-black/60">
          <div>© {new Date().getFullYear()} AV Food Factory • Lucknow</div>
          <div className="text-center md:text-right space-x-2">
            <span>Developed by</span>
            <Link
              href="https://digipants.com/"
              target="_blank"
              className="text-[#C5A46D] font-medium hover:underline"
            >
              DigiPants Network Pvt.
            </Link>
            <span>·</span>
            <Link
              href="/privacy"
              className="underline decoration-transparent hover:decoration-[#C5A46D] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
