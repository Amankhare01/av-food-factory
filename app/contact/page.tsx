"use client";

import { motion } from "framer-motion";
import USPs from "@/components/USPs";
import MenuPreview from "@/components/MenuPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import ContactPage from "@/components/Contact";

export default function Page() {
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
        <ContactPage />
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        transition={{ duration: 0.7, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <USPs />
      </motion.section>

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
