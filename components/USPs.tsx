export default function USPs() {
  const items = [
    { title: 'Authentic Awadhi', desc: 'Galouti, Kakori, Lucknowi Biryani, Sheermal & more—recipes perfected.' },
    { title: 'Design-Led Buffet', desc: 'Ivory linens, brass accents, crafted labels—timeless Nawabi look.' },
    { title: 'End-to-End', desc: 'Menu curation, live counters, service staff, rentals, and decor partners.' },
    { title: 'Dietary Friendly', desc: 'Jain, vegan, gluten-free & kids menus with separate prep protocols.' }
  ];
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-heading text-3xl md:text-4xl">Why hosts choose us</h2>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border border-black/10 bg-white p-6 hover:shadow-md transition">
            <div className="h-10 w-10 rounded-full bg-nawab-emerald/10 grid place-content-center text-nawab-emerald mb-3">★</div>
            <h3 className="font-semibold">{it.title}</h3>
            <p className="text-sm text-black/70 mt-1">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
