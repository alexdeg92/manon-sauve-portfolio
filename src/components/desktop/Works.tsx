"use client";

import { useMemo, useState } from "react";
import { Painting } from "@/data/paintings";
import { Category, CATEGORY_LABELS, categoryOf, formatPrice } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";

interface WorksProps {
  paintings: Painting[];
  onOpen: (painting: Painting, visible: Painting[]) => void;
}

type StatusFilter = "all" | "dispo" | "vendu";
type Sort = "year-desc" | "year-asc" | "price-asc" | "price-desc";

const CATEGORY_ORDER: Category[] = ["portrait", "silhouette", "danse", "abstrait", "autre"];

export default function Works({ paintings, onOpen }: WorksProps) {
  const { lang, t } = useSite();
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<Sort>("year-desc");

  const categories = useMemo(() => {
    const present = new Set(paintings.map(categoryOf));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [paintings]);

  const shown = useMemo(() => {
    const filtered = paintings.filter((p) => {
      const categoryOk = category === "all" || categoryOf(p) === category;
      const statusOk = status === "all" || (status === "vendu" ? Boolean(p.sold) : !p.sold);
      return categoryOk && statusOk;
    });
    const [key, dir] = sort.split("-") as ["year" | "price", "asc" | "desc"];
    return [...filtered].sort((a, b) => {
      // Works without a price sort last regardless of direction.
      const va = key === "year" ? a.year : (a.price ?? Number.POSITIVE_INFINITY);
      const vb = key === "year" ? b.year : (b.price ?? Number.POSITIVE_INFINITY);
      return dir === "asc" ? va - vb : vb - va;
    });
  }, [paintings, category, status, sort]);

  return (
    <section id="oeuvres" className="px-14 pt-[150px]">
      <Reveal>
        <div className="flex items-end justify-between gap-10 border-b border-m-ink pb-[26px]">
          <h2 className="m-0 text-[64px] font-normal tracking-[-.03em]">
            {t("Les œuvres", "The works")}
          </h2>
          <p className="m-0 mb-2 max-w-[320px] font-editorial text-[16px] leading-[1.6] text-m-stone-deep">
            {lang === "en"
              ? `${paintings.length} pieces. Filter by subject, availability or year.`
              : `${paintings.length} pièces. Filtrez par sujet, disponibilité ou année.`}
          </p>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="flex flex-wrap items-center justify-between gap-[30px] pb-10 pt-[26px]">
          <div className="flex flex-wrap gap-2">
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              {t("Tout", "All")}
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABELS[c][lang]}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-[22px]">
            <div className="flex gap-2">
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label={t("Trier", "Sort")}
              className="cursor-pointer rounded-full border border-[#D8D3C8] bg-transparent px-[18px] py-2.5 text-[13px]"
            >
              <option value="year-desc">{t("Plus récentes", "Newest first")}</option>
              <option value="year-asc">{t("Plus anciennes", "Oldest first")}</option>
              <option value="price-asc">{t("Prix croissant", "Price: low to high")}</option>
              <option value="price-desc">{t("Prix décroissant", "Price: high to low")}</option>
            </select>
          </div>
        </div>
      </Reveal>

      {shown.length === 0 ? (
        <div className="py-[70px] text-center font-editorial text-[20px] italic text-m-quiet">
          {t("Aucune œuvre ne correspond à ces filtres.", "No work matches these filters.")}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-10 gap-y-14">
          {shown.map((painting, i) => (
            <Reveal key={painting.id} index={i % 3}>
              <figure
                onClick={() => onOpen(painting, shown)}
                className="group m-0 cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-m-sand">
                  <div className="absolute inset-0 transition-transform duration-[1300ms] group-hover:scale-105">
                    <PaintingImage src={painting.image} alt={painting.title} sizes="33vw" />
                  </div>
                </div>
                <figcaption className="flex justify-between gap-4 pt-4">
                  <div>
                    <div className="font-editorial text-[21px] italic">{painting.title}</div>
                    <div className="mt-[5px] text-[13px] text-m-quiet">
                      {painting.year} · {painting.dimensions}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-[14px] ${painting.sold ? "text-m-stone-soft line-through" : ""}`}
                    >
                      {formatPrice(painting.price, lang)}
                    </div>
                    <div
                      className={`mt-1.5 text-[11px] uppercase tracking-[.14em] ${
                        painting.sold ? "text-m-stone-soft" : "text-m-sage"
                      }`}
                    >
                      {painting.sold ? t("Vendu", "Sold") : t("Disponible", "Available")}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
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
      className={`rounded-full border px-5 py-2.5 text-[13px] transition-all duration-300 ${
        active
          ? "border-m-ink bg-m-ink text-m-paper"
          : "border-[#D8D3C8] bg-transparent text-m-stone-deep hover:border-m-ink"
      }`}
    >
      {children}
    </button>
  );
}
