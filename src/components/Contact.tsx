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
          <div className="mt-8">
            <a
              href="https://www.instagram.com/manonsauve_art"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Suivez-moi sur Instagram — @manonsauve_art
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
