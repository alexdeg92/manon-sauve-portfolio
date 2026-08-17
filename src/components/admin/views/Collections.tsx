"use client";

import { useMemo } from "react";
import { Painting } from "@/data/paintings";
import { Category, CATEGORY_LABELS, categoryOf } from "@/lib/mobile";

const ORDER: Category[] = ["portrait", "silhouette", "danse", "abstrait", "autre"];

/**
 * Collections are derived from the same rule the public site groups by, since
 * the catalogue has no collection column. Counts and thumbnails are therefore
 * real; creating a custom collection needs a schema change first.
 */
export default function Collections({
  paintings,
  onEdit,
}: {
  paintings: Painting[];
  onEdit: (painting: Painting) => void;
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<Category, Painting[]>();
    paintings.forEach((p) => {
      const key = categoryOf(p);
      byCategory.set(key, [...(byCategory.get(key) ?? []), p]);
    });
    return ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      category: c,
      name: CATEGORY_LABELS[c].fr,
      works: byCategory.get(c) ?? [],
    }));
  }, [paintings]);

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="max-w-[620px] rounded-[12px] border border-dashed border-m-line-strong bg-m-sand-soft px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
        Les collections ci-dessous sont déduites du titre de chaque œuvre, comme sur le site
        public. Pour créer et nommer vos propres séries, il faudra ajouter une colonne
        <span className="font-medium"> collection</span> au catalogue.
      </div>

      <div className="mt-[22px] grid grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group.category}
            className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-[22px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="m-0 font-editorial text-[22px] font-light italic">{group.name}</h3>
                <div className="mt-1 text-[12px] text-m-stone">
                  {group.works.length} {group.works.length === 1 ? "œuvre" : "œuvres"} ·{" "}
                  {group.works.filter((w) => !w.sold).length} disponible
                  {group.works.filter((w) => !w.sold).length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="mt-[18px] flex gap-1.5">
              {group.works.slice(0, 4).map((work) => (
                <button
                  key={work.id}
                  onClick={() => onEdit(work)}
                  title={work.title}
                  className="aspect-[4/5] flex-1 overflow-hidden rounded-[7px] bg-m-sand"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={work.image} alt={work.title} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
