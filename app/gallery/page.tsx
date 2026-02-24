"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";

const images = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <NavBar />

      <section className="relative mt-10 overflow-hidden">
        {/* background pattern */}
        <div className="absolute inset-0 text-nawab-gold/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]" />

        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h1 className="font-heading text-4xl md:text-6xl">
              Our <span className="text-nawab-emerald">Gallery</span>
            </h1>
            <p className="mt-4 text-black/70 max-w-2xl mx-auto">
              A glimpse into our elegant spreads, signature dishes, and
              unforgettable celebrations.
            </p>
          </motion.div>

          {/* Image Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10"
                onClick={() => setSelectedImage(img.src)}
              >
                <div className="relative h-72 w-full">
                  <Image
                    src={img.src}
                    alt="Gallery Image"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <span className="text-white text-sm tracking-wider border px-4 py-2 rounded-full">
                    View
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full aspect-video"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Full View"
                fill
                className="object-contain rounded-2xl"
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-xl"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}