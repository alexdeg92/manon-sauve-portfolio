"use client";

import { Painting } from "@/data/paintings";
import { metaLine, priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Sheet from "./Sheet";
import PaintingImage from "@/components/site/PaintingImage";

interface WorkSheetProps {
  painting: Painting | null;
  open: boolean;
  onClose: () => void;
  onEnquire: (painting: Painting) => void;
}

export default function WorkSheet({ painting, open, onClose, onEnquire }: WorkSheetProps) {
  const { lang, t, isFavorite, toggleFavorite } = useSite();
  const saved = painting ? isFavorite(painting.id) : false;

  return (
    <Sheet open={open && Boolean(painting)} onClose={onClose}>
      {painting && (
        <>
          <div className="px-6 pt-1.5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-m-sand">
              <PaintingImage src={painting.image} alt={painting.title} sizes="100vw" />
            </div>
          </div>
          <div className="px-6 pb-[30px] pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={`text-[10px] uppercase tracking-[.2em] ${
                    painting.sold ? "text-m-stone-soft" : "text-m-sage"
                  }`}
                >
                  {painting.sold ? t("Vendu", "Sold") : t("Disponible", "Available")}
                </div>
                <h3 className="mt-2 font-editorial text-[30px] font-light italic">
                  {painting.title}
                </h3>
                <div className="mt-1.5 text-[13px] text-m-stone">{metaLine(painting)}</div>
              </div>
              <button
                onClick={() => toggleFavorite(painting)}
                aria-pressed={saved}
                aria-label={t("Ajouter aux favoris", "Save this work")}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  saved
                    ? "border-m-ink bg-m-ink text-m-paper"
                    : "border-m-line-strong bg-transparent text-m-ink"
                }`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 20.5 4.5 13a4.6 4.6 0 0 1 7.5-5.3A4.6 4.6 0 0 1 19.5 13z" />
                </svg>
              </button>
            </div>

            {/* The artist's own note when there is one, else the standard blurb. */}
            <p className="mt-[18px] font-editorial text-[16px] leading-[1.65] text-m-stone-deep">
              {painting.note?.trim() ||
                t(
                  "Acrylique sur toile, signée. Expédiée depuis l'atelier de Saint-Joseph-du-Lac, montée sur châssis et prête à accrocher.",
                  "Acrylic on canvas, signed. Shipped from the Saint-Joseph-du-Lac studio, stretched and ready to hang."
                )}
            </p>

            <div className="mt-[22px] text-[26px] tracking-[-.02em]">
              {priceLabel(painting, lang)}
            </div>

            <div className="mt-[18px] flex gap-2.5">
              <button
                onClick={() => onEnquire(painting)}
                className="flex-1 rounded-full bg-m-ink py-4 text-[14px] text-m-paper"
              >
                {t("Demander cette œuvre", "Enquire")}
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-m-line-strong px-5 py-4 text-[14px]"
              >
                {t("Fermer", "Close")}
              </button>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
