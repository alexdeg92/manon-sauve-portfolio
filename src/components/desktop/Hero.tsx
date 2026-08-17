"use client";

import { useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import PaintingImage from "@/components/site/PaintingImage";

export default function Hero({ paintings }: { paintings: Painting[] }) {
  const { lang, t } = useSite();
  const [offset, setOffset] = useState(0);
  const featured = paintings[0];

  // Slow parallax drift on the hero canvas, capped so it never clips out.
  useEffect(() => {
    const onScroll = () => setOffset(Math.max(-60, -window.scrollY * 0.08));
    const handler = () => requestAnimationFrame(onScroll);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section id="top" className="relative px-14 pt-[170px]">
      <div className="grid grid-cols-[1.05fr_.95fr] items-end gap-16">
        <div>
          <div className="mb-[30px] flex animate-mFade items-center gap-3.5">
            <span className="block h-px w-11 bg-m-sage" />
            <span className="text-[12px] uppercase tracking-[.22em] text-m-quiet">
              {t(
                "Saint-Joseph-du-Lac · Atelier ouvert sur rendez-vous",
                "Saint-Joseph-du-Lac · Studio open by appointment"
              )}
            </span>
          </div>

          <h1 className="m-0 text-[96px] font-normal leading-[.94] tracking-[-.035em]">
            <span className="block">{t("Figures, silhouettes", "Figures, silhouettes")}</span>
            <span className="block font-editorial font-light italic text-m-sage">
              {t("et couleur", "and colour")}
            </span>
          </h1>

          <p className="mt-[34px] max-w-[430px] font-editorial text-[19px] leading-[1.65] text-m-stone-deep">
            {t(
              "Acrylique et techniques mixtes sur toile. Chaque pièce est unique, signée, et expédiée depuis l'atelier de Saint-Joseph-du-Lac.",
              "Acrylic and mixed media on canvas. Each piece is one of a kind, signed, and shipped from the Saint-Joseph-du-Lac studio."
            )}
          </p>

          <div className="mt-11 flex items-center gap-7">
            <a
              href="#oeuvres"
              className="rounded-full bg-m-ink px-[30px] py-4 text-[14px] tracking-[.03em] text-m-paper transition-all duration-500 hover:-translate-y-[3px] hover:bg-m-sage"
              style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
            >
              {t("Voir les œuvres", "See the works")}
            </a>
            <a
              href="#atelier"
              className="border-b border-[#C9C3B7] pb-[3px] text-[14px] transition-colors duration-300 hover:border-m-sage"
            >
              {t("Réserver une visite d'atelier", "Book a studio visit")}
            </a>
          </div>

          <div className="mt-[76px] flex animate-mFade gap-14 border-t border-m-line pt-[26px]">
            <Stat value="40+" label={t("ans de peinture", "years painting")} />
            <Stat
              value={String(paintings.length)}
              label={t("œuvres au catalogue", "works in the catalogue")}
            />
            <Stat
              value={String(paintings.filter((p) => !p.sold).length)}
              label={t("disponibles", "available")}
            />
          </div>
        </div>

        {featured && (
          <figure className="relative m-0 animate-mFade">
            <div className="relative aspect-[3/4] overflow-hidden bg-m-sand">
              <div
                className="absolute inset-x-0 -top-[5%] h-[110%] will-change-transform"
                style={{ transform: `translateY(${offset}px)` }}
              >
                {/* No `priority`: see the note in the mobile home screen. */}
                <PaintingImage src={featured.image} alt={featured.title} sizes="45vw" />
              </div>
            </div>
            <figcaption className="absolute -left-[34px] bottom-[34px] max-w-[250px] bg-m-paper px-[26px] py-5">
              <div className="text-[11px] uppercase tracking-[.2em] text-m-sage">
                {t("Œuvre à l'honneur", "Featured work")}
              </div>
              <div className="mt-2 font-editorial text-[24px] italic">{featured.title}</div>
              <div className="mt-1.5 text-[13px] text-m-quiet">
                {featured.year} · {featured.dimensions} · {priceLabel(featured, lang)}
              </div>
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[30px] tracking-[-.02em]">{value}</div>
      <div className="mt-1.5 text-[12px] uppercase tracking-[.14em] text-m-quiet">{label}</div>
    </div>
  );
}
