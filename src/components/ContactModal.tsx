"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Painting } from "@/data/paintings";

interface ContactModalProps {
  painting: Painting | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ painting, isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const defaultMessage = painting
    ? `Bonjour Manon,\n\nJe suis intéressé(e) par votre œuvre « ${painting.title} » (${painting.price} $ CAD).\n\nMerci de me contacter pour plus d'informations.`
    : "";

  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      const res = await fetch("https://formsubmit.co/ajax/manonsauve65@hotmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "Non fourni",
          message: formData.message || defaultMessage,
          _subject: painting
            ? `Demande: ${painting.title}`
            : "Nouveau message depuis votre site",
          painting: painting?.title || "Aucune",
        }),
      });
      const data = await res.json();
      if (data.success === "true") {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
          setFormData({ name: "", email: "", phone: "", message: "" });
        }, 2500);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="relative bg-cream w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 md:p-10 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-charcoal transition-colors text-2xl leading-none"
            >
              ×
            </button>

            {submitted ? (
              <div className="text-center py-12">
                <p className="font-serif text-2xl text-charcoal mb-3">Merci!</p>
                <p className="text-muted">Votre message a été envoyé. Je vous répondrai bientôt.</p>
              </div>
            ) : (
              <>
                <p className="text-xs tracking-[0.4em] uppercase text-accent mb-3">Contact</p>
                <h3 className="font-serif text-2xl md:text-3xl text-charcoal mb-1">
                  {painting ? "Demande d'information" : "Écrivez-moi"}
                </h3>
                {painting && (
                  <p className="text-muted text-sm mb-6">
                    Re: <span className="italic">{painting.title}</span> — {painting.price} $ CAD
                  </p>
                )}
                {!painting && <div className="separator !mx-0 mt-4 mb-8" />}

                <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-muted mb-2">
                      Nom complet *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-charcoal/20 focus:border-accent py-2 outline-none transition-colors text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-muted mb-2">
                      Courriel *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent border-b border-charcoal/20 focus:border-accent py-2 outline-none transition-colors text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-muted mb-2">
                      Téléphone <span className="normal-case text-muted/60">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-charcoal/20 focus:border-accent py-2 outline-none transition-colors text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-muted mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={defaultMessage}
                      className="w-full bg-transparent border-b border-charcoal/20 focus:border-accent py-2 outline-none transition-colors text-charcoal resize-none placeholder:text-muted/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-charcoal text-cream py-3.5 text-xs tracking-[0.3em] uppercase hover:bg-accent transition-colors duration-500 mt-4"
                  >
                    Envoyer
                  </button>
                  {error && (
                    <p className="text-red-600 text-sm text-center mt-3">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
