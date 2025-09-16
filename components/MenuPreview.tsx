import Image from 'next/image';

const items = [
  { name: 'Galouti on Sheermal', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop', tag: 'Signature' },
  { name: 'Lucknowi Biryani', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop', tag: 'Classic' },
  { name: 'Shahi Tukda', img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1600&auto=format&fit=crop', tag: 'Dessert' }
];

export default function MenuPreview() {
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-3xl md:text-4xl">A taste of the Nawab’s table</h2>
        <a href="#cta" className="hidden md:inline-flex rounded-full border border-nawab-emerald px-4 py-2 text-sm text-nawab-emerald hover:bg-nawab-emerald/10">
          Build my menu
        </a>
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {items.map((i) => (
          <figure key={i.name} className="group overflow-hidden rounded-3xl border border-black/10 bg-white">
            <div className="relative h-56">
              <Image src={i.img} alt={i.name} fill className="object-cover group-hover:scale-105 transition" />
            </div>
            <figcaption className="p-5">
              <span className="inline-block text-[11px] tracking-widest uppercase text-nawab-gold">{i.tag}</span>
              <h3 className="mt-1 font-semibold">{i.name}</h3>
              <p className="text-sm text-black/70 mt-1">Melt-in-mouth textures, slow-cooked aromas, plated to impress.</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 md:hidden">
        <a href="#cta" className="inline-flex rounded-full border border-nawab-emerald px-4 py-2 text-sm text-nawab-emerald hover:bg-nawab-emerald/10">Build my menu</a>
      </div>
    </section>
  );
}
