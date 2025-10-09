"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const whatsappNumber = "917880561870";

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
    desc: "Delicious spreads, fun themes, and menus designed to add flavor and joy to every celebration.",
  },
  {
    name: "Corporate & Party Events",
    img: "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?w=800&auto=format&fit=crop&q=80",
    tag: "Professional Touch",
    desc: "Perfectly organized catering for office events, product launches, and formal parties.",
  },
  {
    name: "Home Functions & Festive Feasts",
    img: "https://images.unsplash.com/photo-1645886702063-802aa1763ab4?w=800&auto=format&fit=crop&q=80",
    tag: "Family Celebrations",
    desc: "Authentic home-style cooking with Nawabi finesse for intimate family gatherings and festivals.",
  },
  {
    name: "Outdoor & Live Counters",
    img: "https://5.imimg.com/data5/FE/AO/RG/SELLER-102373353/j008-jpg-500x500.jpg",
    tag: "Signature Experience",
    desc: "From kebab stations to chaat corners, our live counters bring aroma, theatre, and excitement.",
  },
  {
    name: "Desserts & Sweets Table",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop",
    tag: "Sweet Endings",
    desc: "Classic Indian desserts like Shahi Tukda, Phirni, and Rabri - handcrafted to end your meal on a royal note.",
  },
  {
    name: "Engagements & Anniversaries",
    img: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1600&auto=format&fit=crop",
    tag: "Memorable Affairs",
    desc: "Celebrate love milestones with exquisite canapes, themed cuisines, and a bespoke presentation.",
  },
  {
    name: "High Tea & Social Gatherings",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1600&auto=format&fit=crop",
    tag: "Elegant Evenings",
    desc: "Aromatic teas, delicate snacks, and gourmet finger foods - perfect for casual or business meets.",
  },
  {
    name: "Religious & Cultural Events",
    img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=1600&auto=format&fit=crop",
    tag: "Tradition Served Right",
    desc: "Pure-veg offerings for Poojas, Jaagrans, Iftars, and festive community gatherings.",
  },
  {
    name: "School & College Events",
    img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=1600&auto=format&fit=crop",
    tag: "Youth Celebrations",
    desc: "Affordable and fun catering for student fests, farewell parties, and annual functions.",
  },
];

export default function ServicesPage() {
  const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: cubicEase },
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: cubicEase },
    },
  };

  const handleQuote = (serviceName: string) => {
    const message = encodeURIComponent(
      `Hello AV Food Factory,\n\nI'm interested in your *${serviceName}* catering service.\nPlease share a customized quote and menu details.\n\nContact: [Your Number]\nName: [Your Name]`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-[#faf6f1] min-h-screen py-20 px-6 md:px-12 lg:px-24"
    >
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-6xl mx-auto text-center mb-14"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f766e] mb-4">
          Our Catering Services
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
          From grand weddings to intimate dinners, AV Food Factory brings authentic Nawabi flavors and unmatched hospitality to every celebration.
        </p>
      </motion.div>

      {/* Service Cards */}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >

        {services.map((service) => (
          <motion.div
            key={service.name}
            variants={card}
            className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-xl transition-transform hover:-translate-y-2"
          >
            {/* Image */}
            <div className="relative h-56">
              <Image
                src={service.img}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <span className="inline-block text-[11px] tracking-widest uppercase text-[#C5A46D] mb-1">
                {service.tag}
              </span>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-black/70 leading-relaxed mb-4">
                {service.desc}
              </p>

              <button
                onClick={() => handleQuote(service.name)}
                className="mt-auto inline-flex items-center justify-center rounded-full bg-[#0f766e] text-white text-sm font-medium px-5 py-2 hover:bg-[#115e59] transition"
              >
                Get Quote on WhatsApp
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
