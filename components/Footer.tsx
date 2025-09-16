export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-heading text-xl">AV Food Factory</h3>
          <p className="text-sm text-black/70 mt-1">Dastarkhwan-style catering rooted in Lucknow’s Nawabi hospitality.</p>
        </div>
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
            <li><a href="#menu" className="hover:text-nawab-emerald">Menu</a></li>
            <li><a href="#services" className="hover:text-nawab-emerald">Services</a></li>
            <li><a href="#cta" className="hover:text-nawab-emerald">Get a Quote</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-black/50 pb-6">© {new Date().getFullYear()} AV Food Factory • Lucknow</div>
    </footer>
  );
}
