"use client";

import { useMemo, useState } from "react";
import { Painting } from "@/data/paintings";
import { Category, CATEGORY_LABELS, categoryOf, priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";

interface GalerieProps {
  paintings: Painting[];
  onOpenWork: (painting: Painting) => void;
}

type StatusFilter = "all" | "dispo" | "vendu";

const CATEGORY_ORDER: Category[] = ["portrait", "silhouette", "danse", "abstrait", "autre"];

export default function Galerie({ paintings, onOpenWork }: GalerieProps) {
  const { lang, t } = useSite();
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  // Only offer a category chip when the catalogue actually contains one.
  const categories = useMemo(() => {
    const present = new Set(paintings.map(categoryOf));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [paintings]);

  const shown = paintings.filter((p) => {
    const categoryOk = category === "all" || categoryOf(p) === category;
    const statusOk =
      status === "all" || (status === "vendu" ? Boolean(p.sold) : !p.sold);
    return categoryOk && statusOk;
  });

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Galerie", "Gallery")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {lang === "en"
            ? `${paintings.length} pieces, filtered.`
            : `${paintings.length} pièces, filtrées.`}
        </p>
      </div>

      <div className="m-rail flex gap-2 overflow-x-auto px-6 pb-1 pt-5">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          {t("Tout", "All")}
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_LABELS[c][lang]}
          </Chip>
        ))}
      </div>

      <div className="flex gap-2 px-6 pt-2.5">
        <Chip active={status === "all"} onClick={() => setStatus("all")}>
          {t("Tout statut", "Any status")}
        </Chip>
        <Chip active={status === "dispo"} onClick={() => setStatus("dispo")}>
          {t("Disponible", "Available")}
        </Chip>
        <Chip active={status === "vendu"} onClick={() => setStatus("vendu")}>
          {t("Vendu", "Sold")}
        </Chip>
      </div>

      {shown.length === 0 ? (
        <div className="px-6 py-[50px] text-center font-editorial italic text-m-stone">
          {t("Aucune œuvre ne correspond à ces filtres.", "No work matches these filters.")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 px-6 pt-6">
          {shown.map((painting, i) => (
            <Reveal key={painting.id} index={i % 4}>
              <button onClick={() => onOpenWork(painting)} className="w-full text-left">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-m-sand">
                  <PaintingImage src={painting.image} alt={painting.title} sizes="50vw" />
                </div>
                <div className="mt-[9px] font-editorial text-[16px] italic">{painting.title}</div>
                <div
                  className={`mt-0.5 text-[12px] ${painting.sold ? "text-m-stone-soft" : "text-m-stone"}`}
                >
                  {priceLabel(painting, lang)}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-[17px] py-[9px] text-[13px] transition-all duration-300 ${
        active
          ? "border-m-ink bg-m-ink text-m-paper"
          : "border-m-line-strong bg-transparent text-m-stone-deep"
      }`}
    >
      {children}
    </button>
  );
}
