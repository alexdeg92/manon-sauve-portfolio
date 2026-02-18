"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="a-propos" className="py-28 md:py-36 bg-warm">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-4">L&apos;artiste</p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">À propos</h2>
          <div className="separator mb-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="aspect-[4/5] bg-cream rounded-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80"
              alt="Manon Sauvé dans son atelier"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 text-muted leading-relaxed font-light">
            <p>
              Née au cœur de la région de Lanaudière, Manon Sauvé peint depuis plus de vingt ans.
              Inspirée par les paysages changeants du Québec, elle capture sur toile la lumière
              éphémère des saisons et l&apos;émotion tranquille de la nature.
            </p>
            <p>
              Ses œuvres, principalement réalisées à l&apos;huile et à l&apos;acrylique, se
              distinguent par leur palette chaleureuse et leur composition harmonieuse. Chaque
              tableau est une invitation à la contemplation et au calme.
            </p>
            <p>
              Manon a exposé dans plusieurs galeries au Québec et ses œuvres font partie de
              collections privées au Canada et en Europe. Elle travaille depuis son atelier à
              Joliette, où elle accueille les visiteurs sur rendez-vous.
            </p>
            <p className="text-accent italic font-serif text-lg">
              « Peindre, c&apos;est offrir un moment de silence dans un monde bruyant. »
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
