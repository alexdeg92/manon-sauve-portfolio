"use client";

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
        <Reveal className="mx-6 mt-[22px]">
          <button
            onClick={() => onOpenWork(featured)}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-m-sand text-left"
          >
            {/* No `priority`: both breakpoint trees stay mounted, and an
                eager image would download in the hidden one too. */}
            <PaintingImage src={featured.image} alt={featured.title} sizes="100vw" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-m-ink/[.82] to-transparent px-[22px] pb-[22px] pt-[70px] text-m-paper">
              <div className="text-[10px] uppercase tracking-[.2em] text-m-sage-pale">
                {t("Œuvre à l'honneur", "Featured work")}
              </div>
              <div className="mt-1.5 font-editorial text-[28px] italic">{featured.title}</div>
              <div className="mt-1 text-[13px] text-[#D6D2C9]">
                {metaLine(featured)} · {priceLabel(featured, lang)}
              </div>
            </div>
          </button>
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
