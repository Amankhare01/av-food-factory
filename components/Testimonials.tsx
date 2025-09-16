export default function Testimonials() {
  const data = [
    { name: 'Riya & Arjun • Wedding', quote: 'The Galouti and live counters were the talk of the night. Flawless service.' },
    { name: 'TCS Lucknow • Corporate', quote: 'Immaculate setup, punctual team, and the biryani vanished in minutes!' },
    { name: 'Kapoor Family • Sangeet', quote: 'Authentic Lucknowi flavours with premium presentation. Five stars.' }
  ];

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-heading text-3xl md:text-4xl">Hosts who became fans</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {data.map((d) => (
          <blockquote key={d.name} className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-black/80 italic">“{d.quote}”</p>
            <footer className="mt-3 text-sm text-black/60">{d.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
