"use client";

import { Painting } from "@/data/paintings";
import { metaLine, priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import PaintingImage from "@/components/site/PaintingImage";

interface FavorisProps {
  paintings: Painting[];
  onOpenWork: (painting: Painting) => void;
}

export default function Favoris({ paintings, onOpenWork }: FavorisProps) {
  const { lang, t, favorites, toggleFavorite } = useSite();

  // Drive the order off the saved list so newly saved works land at the bottom.
  const saved = favorites
    .map((id) => paintings.find((p) => p.id === id))
    .filter((p): p is Painting => Boolean(p));

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Favoris", "Saved")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {t("Marquez une œuvre pour la garder ici.", "Tap the mark on a work to keep it here.")}
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="px-[30px] py-[60px] text-center">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9C3B7"
            strokeWidth="1.2"
            className="mx-auto"
          >
            <path d="M12 20.5 4.5 13a4.6 4.6 0 0 1 7.5-5.3A4.6 4.6 0 0 1 19.5 13z" />
          </svg>
          <div className="mt-3.5 font-editorial text-[17px] italic text-m-stone">
            {t("Aucun favori pour le moment.", "Nothing saved yet.")}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 px-6 pt-6">
          {saved.map((painting) => (
            <div
              key={painting.id}
              className="flex animate-mRise items-center gap-3.5 rounded-[16px] border border-m-line p-3"
            >
              <button
                onClick={() => onOpenWork(painting)}
                className="relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-[10px] bg-m-sand"
              >
                <PaintingImage src={painting.image} alt={painting.title} sizes="58px" />
              </button>
              <button
                onClick={() => onOpenWork(painting)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="font-editorial text-[17px] italic">{painting.title}</div>
                <div className="mt-1 truncate text-[12px] text-m-stone">
                  {metaLine(painting)} · {priceLabel(painting, lang)}
                </div>
              </button>
              <button
                onClick={() => toggleFavorite(painting)}
                className="shrink-0 rounded-full border border-m-line-strong px-3.5 py-[9px] text-[12px]"
              >
                {t("Retirer", "Remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
