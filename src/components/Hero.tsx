"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm via-cream to-cream" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent-light/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-accent mb-8 font-sans font-light" style={{ fontFamily: "'Cormorant SC', Georgia, serif", letterSpacing: "0.45em", fontSize: "0.7rem" }}>
            Artiste Peintre
          </p>

          <h1 className="font-serif italic text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-light text-charcoal leading-none tracking-tight" style={{ fontWeight: 300 }}>
            Manon
            <br />
            Sauvé
          </h1>

          <div className="separator mt-16 mb-10" />

          <p className="text-muted font-light max-w-md mx-auto leading-relaxed mb-10">
            Voici une sélection d&apos;œuvres marquantes qui explorent le corps féminin et l&apos;émotion intérieure des femmes, à travers différentes époques et sensibilités artistiques.
          </p>

          <a
            href="#galerie"
            className="inline-block border border-charcoal/30 px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-500"
          >
            Découvrir mes œuvres
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-accent-light/50" />
      </motion.div>
    </section>
  );
}
