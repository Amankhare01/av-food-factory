import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/5 bg-white">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-10">
        {/* Brand Info */}
        <div>
          <Link href="/" className="group inline-flex items-center gap-2">
              <div className="relative w-[150px] h-[50px] sm:w-[150px] sm:h-[60px]">
                <Image
                  src="/logo.svg"
                  alt="AV-TRADE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
          </Link>
          <p className="text-sm text-black/70 mt-2 leading-relaxed">
            Dastarkhwan-style catering rooted in Lucknow’s Nawabi hospitality.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="text-sm text-black/70 space-y-2">
            <li className="flex items-center gap-2">
              <FaWhatsapp className="text-green-600 text-lg" />
              <a
                href="https://wa.me/917880561870"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-nawab-emerald"
              >
                +91 788 056 1870
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-nawab-emerald text-lg" />
              <a
                href="mailto:support@avfoodfactory.com"
                className="hover:text-nawab-emerald"
              >
                support@avfoodfactory.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-nawab-emerald text-lg mt-1" />
              <span>
                First Floor, Priyadarshini Apartment, 05, Wazir Hasan Road,
                Hazratganj, Lucknow, Uttar Pradesh
                226001, Lucknow
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick links</h4>
          <ul className="text-sm text-black/70 space-y-2">
            <li>
              <a href="#menu" className="hover:text-nawab-emerald">
                Menu
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-nawab-emerald">
                Services
              </a>
            </li>
            <li>
              <Link href="/terms" className="hover:text-nawab-emerald">
                Terms
              </Link>
            </li>
            <li>
              <a href="#cta" className="hover:text-nawab-emerald">
                Get a Quote
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-black/50">
          <div>© {new Date().getFullYear()} AV Food Factory • Lucknow</div>
          <div className="text-center md:text-right">
            <p>
              Developed by{" "}
              <Link
                href="https://digipants.com/"
                target="_blank"
                className="text-[#C5A46D] font-medium"
              >
                DigiPants Network Pvt.
              </Link>{" "}
              ·{" "}
              <Link
                href="/privacy"
                className="underline decoration-transparent hover:decoration-[#C5A46D]"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
