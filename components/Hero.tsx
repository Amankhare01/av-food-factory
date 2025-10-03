import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle jaali pattern */}
      <div className="absolute inset-0 text-nawab-gold/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block rounded-full border border-nawab-gold/40 bg-white/60 px-3 py-1 text-xs tracking-wider text-nawab-emerald">
            Lucknow • Since 2012
          </span>
          <h1 className="font-heading mt-4 text-4xl md:text-6xl leading-tight">
            Nawabi Dastarkhwan,
            <span className="text-nawab-emerald"> served with grace.</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-black/70">
            AV Food Factory crafts <strong>Awadhi & contemporary</strong> menus for weddings, corporate meets, and intimate soirees—
            elegant service, aromas that linger, and plates that convert guests into fans.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#cta" className="rounded-full bg-nawab-emerald px-5 py-3 text-white hover:bg-nawab-emeraldDeep transition">
              Get an Instant Quote
            </a>
            <a href="#menu" className="rounded-full border border-nawab-emerald px-5 py-3 text-nawab-emerald hover:bg-nawab-emerald/10">
              Explore Signature Menu
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-2xl font-semibold">650+</dt>
              <dd className="text-sm text-black/70">Events Catered</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold">4.9★</dt>
              <dd className="text-sm text-black/70">Client Ratings</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold">100%</dt>
              <dd className="text-sm text-black/70">Veg & Non-Veg Kitchens</dd>
            </div>
          </dl>
        </div>

        <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden ring-1 ring-black/10 shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
            alt="Nawabi spread"
            fill
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_60%_at_50%_-20%,black,transparent)]" />
        </div>
      </div>
    </section>
  );
}
