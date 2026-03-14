"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Painting } from "@/data/paintings";

interface GalleryProps {
  paintings: Painting[];
  onSelect: (painting: Painting) => void;
}

export default function Gallery({ paintings, onSelect }: GalleryProps) {
  return (
    <section id="galerie" className="py-28 md:py-36 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-4">Collection</p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Galerie</h2>
          <div className="separator mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {paintings.map((painting, i) => (
            <motion.div
              key={painting.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-warm mb-4">
                <Image
                  src={painting.image}
                  alt={painting.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized={painting.image.startsWith("http")}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-500 flex items-end">
                  <div className="w-full p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button
                      onClick={() => onSelect(painting)}
                      className="w-full bg-cream/95 backdrop-blur-sm text-charcoal text-xs tracking-[0.2em] uppercase py-3 hover:bg-white transition-colors"
                    >
                      Je suis intéressé(e)
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="font-serif text-lg text-charcoal">{painting.title}</h3>
              <p className="text-sm text-muted mt-1">{painting.medium} — {painting.dimensions}</p>
              <p className="text-sm font-medium text-accent mt-1">{painting.sold ? <span className="text-red-500">Vendu</span> : `${painting.price} $ CAD`}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
