export default function CTA() {
  return (
    <section id="cta" className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-nawab-emerald to-nawab-emeraldDeep" />
      <div className="mx-auto max-w-7xl px-4 py-14 text-white">
        <h2 className="font-heading text-3xl md:text-4xl">Planning an event in Lucknow?</h2>
        <p className="mt-2 text-white/90">Tell us your guest count and cuisine mood—we’ll send a curated quote in minutes.</p>

        <form className="mt-6 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
          <input required aria-label="Name" placeholder="Your name" className="h-12 rounded-xl px-4 text-black" />
          <input required aria-label="Phone" placeholder="Phone / WhatsApp" className="h-12 rounded-xl px-4 text-black" />
          <input aria-label="Guests" placeholder="Guests (approx.)" className="h-12 rounded-xl px-4 text-black" />
          <button className="h-12 rounded-xl bg-nawab-gold px-6 font-medium text-ink hover:opacity-95">Get Quote</button>
        </form>

        <p className="mt-3 text-xs text-white/80">By submitting, you agree to be contacted on WhatsApp/SMS for your event.</p>
      </div>
    </section>
  );
}
