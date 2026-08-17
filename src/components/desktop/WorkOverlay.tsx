"use client";

import { useCallback, useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { formatPrice, isRemoteImage } from "@/lib/mobile";
import { useSite } from "@/components/site/context";

interface WorkOverlayProps {
  painting: Painting | null;
  /** The filtered list the work was opened from, for prev/next. */
  siblings: Painting[];
  onSelect: (painting: Painting) => void;
  onClose: () => void;
  onEnquire: (painting: Painting) => void;
}

export default function WorkOverlay({
  painting,
  siblings,
  onSelect,
  onClose,
  onEnquire,
}: WorkOverlayProps) {
  const { lang, t } = useSite();
  const [entered, setEntered] = useState(false);

  const open = Boolean(painting);

  useEffect(() => {
    if (!open) return setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const step = useCallback(
    (delta: number) => {
      if (!painting || siblings.length === 0) return;
      const i = siblings.findIndex((p) => p.id === painting.id);
      const next = (i + delta + siblings.length) % siblings.length;
      onSelect(siblings[next]);
    },
    [painting, siblings, onSelect]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!painting) return null;

  return (
    <div
      className="fixed inset-0 z-[100] transition-opacity duration-500"
      style={{ opacity: entered ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={painting.title}
    >
      <div className="absolute inset-0 bg-m-ink/[.94]" onClick={onClose} />
      <div
        className="absolute inset-0 grid grid-cols-[1.25fr_1fr] transition-transform duration-[600ms]"
        style={{
          transform: entered ? "none" : "scale(.98)",
          transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div className="flex items-center justify-center p-[60px]" onClick={onClose}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={painting.image}
            alt={painting.title}
            onClick={(e) => e.stopPropagation()}
            className="block max-h-full max-w-full object-contain"
            {...(isRemoteImage(painting.image) ? { loading: "lazy" as const } : {})}
          />
        </div>

        <div className="flex flex-col justify-center bg-m-paper px-[60px] py-20">
          <div
            className={`text-[11px] uppercase tracking-[.2em] ${
              painting.sold ? "text-m-stone-soft" : "text-m-sage"
            }`}
          >
            {painting.sold ? t("Vendu", "Sold") : t("Disponible", "Available")}
          </div>
          <h3 className="m-0 mt-4 font-editorial text-[44px] font-light italic tracking-[-.02em]">
            {painting.title}
          </h3>
          <div className="mt-3.5 text-[15px] text-m-quiet">
            {painting.year} · {painting.medium} · {painting.dimensions}
          </div>
          <p className="mt-7 max-w-[400px] font-editorial text-[19px] leading-[1.7] text-m-stone-deep">
            {t(
              "Pièce unique, signée. Expédiée depuis l'atelier de Saint-Joseph-du-Lac, montée sur châssis et prête à accrocher.",
              "One of a kind, signed. Shipped from the Saint-Joseph-du-Lac studio, stretched and ready to hang."
            )}
          </p>
          <div
            className={`mt-9 text-[30px] tracking-[-.02em] ${
              painting.sold ? "text-m-stone-soft" : ""
            }`}
          >
            {formatPrice(painting.price, lang)}
          </div>

          <div className="mt-7 flex gap-3">
            <button
              onClick={() => onEnquire(painting)}
              className="rounded-full bg-m-ink px-[26px] py-[15px] text-[14px] text-m-paper transition-colors duration-500 hover:bg-m-sage"
            >
              {painting.sold
                ? t("Commander une pièce semblable", "Commission something similar")
                : t("Demander cette œuvre", "Enquire about this work")}
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-[#D8D3C8] px-[26px] py-[15px] text-[14px]"
            >
              {t("Fermer", "Close")}
            </button>
          </div>

          {siblings.length > 1 && (
            <div className="mt-11 flex gap-2.5">
              <button
                onClick={() => step(-1)}
                aria-label={t("Œuvre précédente", "Previous work")}
                className="h-11 w-11 rounded-full border border-[#D8D3C8] text-[16px] transition-colors duration-300 hover:border-m-ink"
              >
                ←
              </button>
              <button
                onClick={() => step(1)}
                aria-label={t("Œuvre suivante", "Next work")}
                className="h-11 w-11 rounded-full border border-[#D8D3C8] text-[16px] transition-colors duration-300 hover:border-m-ink"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
