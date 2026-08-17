"use client";

import { useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { metaLine, priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";
import type { ScreenName } from "../nav";

interface AccueilProps {
  paintings: Painting[];
  onOpenWork: (painting: Painting) => void;
  onGoto: (screen: ScreenName) => void;
}

export default function Accueil({ paintings, onOpenWork, onGoto }: AccueilProps) {
  const { lang, setLang, t } = useSite();

  const featured = paintings[0];
  const recent = [...paintings]
    .sort((a, b) => b.year - a.year)
    .filter((p) => p.id !== featured?.id)
    .slice(0, 6);

  return (
    <div className="animate-mFade">
      <div className="flex items-center justify-between px-6 pt-3.5">
        <div>
          <div className="font-editorial text-[15px] italic text-m-quiet">
            {t("Bonjour", "Good morning")}
          </div>
          <div className="mt-0.5 text-[22px] tracking-[-.02em]">Manon Sauvé</div>
        </div>
        <div className="flex gap-0.5 rounded-full border border-m-line-strong p-[3px]">
          {(["fr", "en"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`rounded-full px-[11px] py-1.5 text-[11px] tracking-[.06em] transition-colors duration-300 ${
                lang === code ? "bg-m-ink text-m-paper" : "bg-transparent text-m-stone"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {featured && (
        <Reveal className="mt-[18px]">
          <FeaturedRotator paintings={paintings} onOpenWork={onOpenWork} />
        </Reveal>
      )}

      <Reveal index={1}>
        <div className="flex items-baseline justify-between px-6 pb-3.5 pt-[34px]">
          <h2 className="m-0 text-[20px] font-normal tracking-[-.02em]">
            {t("Œuvres récentes", "Recent works")}
          </h2>
          <button onClick={() => onGoto("galerie")} className="text-[13px] text-m-sage">
            {t("Tout voir", "See all")}
          </button>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="m-rail flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-6 pb-1.5">
          {recent.map((painting) => (
            <button
              key={painting.id}
              onClick={() => onOpenWork(painting)}
              className="w-[168px] shrink-0 snap-start text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-m-sand">
                <PaintingImage src={painting.image} alt={painting.title} sizes="168px" />
              </div>
              <div className="mt-[9px] font-editorial text-[16px] italic">{painting.title}</div>
              <div className="mt-0.5 text-[12px] text-m-stone">
                {painting.year} · {priceLabel(painting, lang)}
              </div>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal index={3}>
        <div className="mx-6 mt-[34px] rounded-[20px] bg-m-ink px-6 py-7 text-m-paper">
          <div className="text-[10px] uppercase tracking-[.2em] text-[#9DB3A1]">
            {t("Visite d'atelier", "Studio visit")}
          </div>
          <div className="mt-2.5 font-editorial text-[26px] italic leading-[1.2]">
            {t("Voir les toiles en personne", "See the canvases in person")}
          </div>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#B5B1A8]">
            {t(
              "Une heure à l'atelier de Saint-Joseph-du-Lac. Sans frais, sans engagement.",
              "One hour at the Saint-Joseph-du-Lac studio. Free, no obligation."
            )}
          </p>
          <button
            onClick={() => onGoto("atelier")}
            className="mt-5 rounded-full bg-m-paper px-6 py-3.5 text-[14px] text-m-ink"
          >
            {t("Choisir une date", "Pick a date")}
          </button>
        </div>
      </Reveal>

      <Reveal index={4}>
        <div className="px-6 pt-[34px]">
          <div className="grid grid-cols-3 gap-3 border-t border-m-line pt-[22px]">
            <Stat value="40+" label={t("ans", "years")} />
            <Stat value={String(paintings.length)} label={t("œuvres", "works")} />
            <Stat value={String(paintings.filter((p) => !p.sold).length)} label={t("disponibles", "available")} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[24px] tracking-[-.02em]">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[.14em] text-m-stone">{label}</div>
    </div>
  );
}

const ROTATION_MS = 2500;
const MAX_SLIDES = 6;

/**
 * Cross-fades the featured work every 2.5s. Slides are only mounted once they
 * have been shown, so the first paint still downloads a single hero image
 * instead of all of them, and the rotation holds still for anyone who asked for
 * reduced motion.
 */
function FeaturedRotator({
  paintings,
  onOpenWork,
}: {
  paintings: Painting[];
  onOpenWork: (painting: Painting) => void;
}) {
  const { lang, t } = useSite();
  const slides = paintings.slice(0, MAX_SLIDES);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<number[]>([0]);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ROTATION_MS
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setMounted((current) => (current.includes(index) ? current : [...current, index]));
  }, [index]);

  const current = slides[index];
  if (!current) return null;

  return (
    <button
      onClick={() => onOpenWork(current)}
      /* Fills the screen below the greeting, minus the floating tab bar. `svh`
         rather than `vh` so mobile browser chrome does not crop it. */
      className="relative block h-[calc(100svh-172px)] min-h-[440px] w-full overflow-hidden bg-m-sand text-left"
    >
      {slides.map((painting, i) => (
        <div
          key={painting.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-all duration-[700ms] ease-out ${
            i === index ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
          }`}
        >
          {/* No `priority`: both breakpoint trees stay mounted, and an
              eager image would download in the hidden one too. */}
          {mounted.includes(i) && (
            <PaintingImage src={painting.image} alt={painting.title} sizes="100vw" />
          )}
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-m-ink/[.88] via-m-ink/40 to-transparent px-6 pb-7 pt-[110px] text-m-paper">
        <div className="text-[10px] uppercase tracking-[.2em] text-m-sage-pale">
          {t("Œuvre à l'honneur", "Featured work")}
        </div>
        {/* Keyed so the caption re-enters with the image rather than snapping. */}
        <div key={current.id} className="animate-mFade">
          <div className="mt-2 font-editorial text-[32px] leading-[1.15] italic">{current.title}</div>
          <div className="mt-1 text-[13px] text-[#D6D2C9]">
            {metaLine(current)} · {priceLabel(current, lang)}
          </div>
        </div>
      </div>
    </button>
  );
}
