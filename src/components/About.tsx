"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function About() {
  const [photoUrl, setPhotoUrl] = useState("/manon-profile.jpg");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile_photo) setPhotoUrl(d.profile_photo);
      })
      .catch(() => {});
  }, []);

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
          <div className="aspect-[3/4] bg-cream rounded-sm overflow-hidden">
            <img
              src={photoUrl}
              alt="Manon Sauvé, artiste peintre"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="space-y-6 text-muted leading-relaxed font-light">
            <p>
              Manon Sauvé est née à Les Cèdres en 1965, au cœur de la région de la Montérégie.
              Artiste peintre autodidacte, elle crée depuis plus de 40 ans.
            </p>
            <p>
              Dès ses débuts, elle développe une passion profonde pour le dessin, discipline
              fondatrice qui demeure au centre de sa démarche artistique. Après des études en
              arts plastiques, elle travaille quelques années dans le domaine de l&apos;imprimerie,
              notamment en sérigraphie sur divers supports, ce qui enrichit sa compréhension
              des techniques et des matières.
            </p>
            <p>
              Elle explore différents médiums, dont le fusain et la gouache, mais privilégie
              l&apos;acrylique pour sa polyvalence et l&apos;étendue des possibilités créatives
              qu&apos;elle offre. Ses lectures, les ateliers de modèle vivant et la fréquentation
              d&apos;expositions nourrissent continuellement sa recherche et contribuent au
              perfectionnement de sa technique.
            </p>
            <p>
              Inspirée par le corps féminin, elle capte sur toile la lumière fugace des femmes
              et la subtilité de leurs émotions. Ses œuvres, aux palettes chaleureuses et aux
              compositions harmonieuses, invitent à la contemplation et à l&apos;apaisement.
            </p>
            <p>
              Elle travaille aujourd&apos;hui depuis son atelier de Saint-Joseph-du-Lac, où elle
              accueille les visiteurs sur rendez-vous.
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
