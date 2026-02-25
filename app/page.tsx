"use client";

import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import USPs from "@/components/USPs";
import MenuPreview from "@/components/MenuPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Image from "next/image";
import { useParallax } from "./hooks/useParallax";

export default function Page() {
  const heroOffset = useParallax(0.25)
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Background Layer */}
        <div
          style={{ transform: `translateY(${heroOffset}px)` }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/images/hero.jpg"
            alt="Catering hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl text-white md:text-7xl font-bold tracking-tight">
            Exceptional Catering
          </h1>

          <p className="mt-6 text-lg text-neutral-100">
            Weddings • Corporate • Private Events
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button className="px-8 py-4 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition">
              Get Quote
            </button>

            <button className="px-8 py-4 border text-white border-white/30 rounded-lg hover:bg-white/10 transition">
              View Menu
            </button>
          </div>
        </div>
      </section>
      </motion.section>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Hero />
      </motion.section>


        <USPs />

      <motion.section
      >
        <MenuPreview />
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <Testimonials />
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        transition={{ duration: 0.8, delay: 0.25 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <CTA />
      </motion.section>
    </>
  );
}
