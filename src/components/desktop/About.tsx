"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";

export default function About() {
  const { t } = useSite();
  const [photo, setPhoto] = useState("/manon-profile.jpg");

  // The admin can replace the portrait; fall back to the bundled one.
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile_photo) setPhoto(d.profile_photo);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="apropos" className="px-14 pt-[150px]">
      <Reveal>
        <div className="grid grid-cols-[.8fr_1.2fr] items-start gap-20">
          <figure className="m-0 aspect-[4/5] overflow-hidden bg-m-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Manon Sauvé"
              className="block h-full w-full object-cover object-center"
            />
          </figure>

          <div>
            <span className="text-[12px] uppercase tracking-[.2em] text-m-sage">
              {t("À propos", "About")}
            </span>
            <h2 className="m-0 mt-5 text-[56px] font-normal tracking-[-.03em]">Manon Sauvé</h2>

            <p className="mt-[26px] max-w-[600px] font-editorial text-[20px] leading-[1.7] text-[#2E2C28]">
              {t(
                "Née aux Cèdres en 1965, artiste peintre autodidacte, je crée depuis plus de quarante ans. Le dessin reste au centre de ma démarche ; l'acrylique, pour sa polyvalence, en est le médium.",
                "Born in Les Cèdres in 1965, a self-taught painter, I have been making work for over forty years. Drawing stays at the centre of the practice; acrylic, for its range, is the medium."
              )}
            </p>
            <p className="mt-5 max-w-[600px] font-editorial text-[20px] leading-[1.7] text-m-stone-deep">
              {t(
                "Inspirée par le corps féminin, je capte sur toile la lumière fugace des femmes et la subtilité de leurs émotions. Le travail oscille entre le portrait reconnaissable et la silhouette dissoute ; ce qui le tient, c'est la couleur.",
                "Drawn to the female body, I try to catch on canvas the fleeting light of women and the subtlety of their emotions. The work moves between recognisable portraits and dissolved silhouettes; what holds it together is colour."
              )}
            </p>

            <blockquote className="mt-7 max-w-[600px] border-l-2 border-m-sage pl-5 font-editorial text-[19px] italic leading-[1.6] text-m-sage">
              {t(
                "« Peindre, c'est offrir un moment de silence dans un monde bruyant. »",
                "“To paint is to offer a moment of silence in a noisy world.”"
              )}
            </blockquote>

            <div className="mt-11 grid grid-cols-3 gap-5 border-t border-m-line pt-7">
              <Fact label={t("Atelier", "Studio")} value="Saint-Joseph-du-Lac, Québec" />
              <Fact
                label={t("Médium", "Medium")}
                value={t("Acrylique, encre, fusain", "Acrylic, ink, charcoal")}
              />
              <Fact
                label={t("Expédition", "Shipping")}
                value={t("Canada et États-Unis", "Canada and United States")}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[.16em] text-m-quiet">{label}</div>
      <div className="mt-2 text-[15px]">{value}</div>
    </div>
  );
}
