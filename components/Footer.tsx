import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/5 bg-white">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-6">
        <div>
          <Link href="/" className="group inline-flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-nawab-emerald grid place-content-center text-white font-bold group-hover:drop-shadow-glow transition">
            AV
          </span>
          <span className="font-heading text-xl tracking-wide font-bold">AV Food Factory</span>
        </Link>
          <p className="text-sm text-black/70 mt-1">
            Dastarkhwan-style catering rooted in Lucknow’s Nawabi hospitality.
          </p>
        </div>
<div className="flex justify-between">
          <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="text-sm text-black/70 mt-2 space-y-1">
            <li>+91 73172 75160</li>
            <li>support@avfoodfactory.com</li>
            <li>Vikas Nagar, Lucknow</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Quick links</h4>
          <ul className="text-sm text-black/70 mt-2 space-y-1">
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
              <a href="/terms" className="hover:text-nawab-emerald">
                Terms
              </a>
            </li>
            <li>
              <a href="#cta" className="hover:text-nawab-emerald">
                Get a Quote
              </a>
            </li>
          </ul>
        </div>
</div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-m text-black/50">
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
