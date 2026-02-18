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
          <p className="text-sm tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            Artiste Peintre
          </p>

          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-charcoal leading-none tracking-tight">
            Manon
            <br />
            <span className="italic font-normal">Sauvé</span>
          </h1>

          <div className="separator mt-10 mb-8" />

          <p className="text-muted font-light max-w-md mx-auto leading-relaxed mb-10">
            Des œuvres qui capturent la lumière et l&apos;émotion du paysage québécois
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
