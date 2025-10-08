"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const services = [
  {
    name: "Wedding Catering",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
    tag: "Grand Occasions",
    desc: "Lavish buffets, live counters, and curated Nawabi feasts that make your wedding unforgettable.",
  },
  {
    name: "Birthday Celebrations",
    img: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop",
    tag: "Joyful Moments",
    desc: "Delicious spreads, fun themes, and a menu designed to add more flavor to your special day.",
  },
  {
    name: "Corporate & Party Events",
    img: "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?w=800&auto=format&fit=crop&q=80",
    tag: "Professional Touch",
    desc: "Perfectly organized catering for office gatherings, parties, and formal celebrations.",
  },
  {
    name: "Home Functions & Festive Feasts",
    img: "https://images.unsplash.com/photo-1645886702063-802aa1763ab4?w=800&auto=format&fit=crop&q=80",
    tag: "Family Celebrations",
    desc: "Authentic home-style dishes and Nawabi indulgence for family gatherings and cultural festivities.",
  },
  {
    name: "Outdoor & Live Counters",
    img: "https://5.imimg.com/data5/FE/AO/RG/SELLER-102373353/j008-jpg-500x500.jpg",
    tag: "Signature Experience",
    desc: "From kebab stations to chaat corners—our live food counters bring aroma and excitement to your event.",
  },
  {
    name: "Desserts & Sweets Table",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop",
    tag: "Sweet Endings",
    desc: "Indulge in classic Shahi Tukda, Phirni, or Gulab Jamun — handcrafted desserts to complete every meal.",
  },
];

export default function ServicesPreview() {
  // Animation variants
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-3xl md:text-4xl text-gray-900">
          Catering Crafted for Every Celebration
        </h2>
        <a
          href="#cta"
          className="hidden md:inline-flex rounded-full border border-nawab-emerald px-4 py-2 text-sm text-nawab-emerald hover:bg-nawab-emerald/10"
        >
          Get a Quote
        </a>
      </div>

      {/* Animated cards */}
      <motion.div
        className="mt-8 grid md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {services.map((service) => (
          <motion.figure
            key={service.name}
            variants={card}
            className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-lg transition"
          >
            <div className="relative h-56">
              <Image
                src={service.img}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <figcaption className="p-5">
              <span className="inline-block text-[11px] tracking-widest uppercase text-[#C5A46D]">
                {service.tag}
              </span>
              <h3 className="mt-1 font-semibold text-lg text-gray-900">
                {service.name}
              </h3>
              <p className="text-sm text-black/70 mt-1 leading-relaxed">
                {service.desc}
              </p>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <div className="mt-6 md:hidden text-center">
        <a
          href="#cta"
          className="inline-flex rounded-full border border-nawab-emerald px-4 py-2 text-sm text-nawab-emerald hover:bg-nawab-emerald/10"
        >
          Get a Quote
        </a>
      </div>
    </section>
  );
}
