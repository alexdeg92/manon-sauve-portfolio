"use client";

import { motion } from "framer-motion";

interface ContactProps {
  onOpenContact: () => void;
}

export default function Contact({ onOpenContact }: ContactProps) {
  return (
    <section id="contact" className="py-28 md:py-36 bg-cream">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-4">Restons en contact</p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">Contact</h2>
          <div className="separator mb-10" />
          <p className="text-muted font-light leading-relaxed mb-10">
            Vous souhaitez acquérir une œuvre, commander une peinture sur mesure ou simplement
            échanger? N&apos;hésitez pas à me contacter. Je réponds habituellement dans les 24 heures.
          </p>
          <button
            onClick={onOpenContact}
            className="inline-block border border-charcoal/30 px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-500"
          >
            Écrivez-moi
          </button>
        </motion.div>
      </div>
    </section>
  );
}
