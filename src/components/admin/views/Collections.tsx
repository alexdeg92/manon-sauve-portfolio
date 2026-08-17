"use client";

import { useMemo } from "react";
import { Painting } from "@/data/paintings";
import { collectionOf } from "@/lib/mobile";

/**
 * Groups the catalogue by collection. A work without a stored collection falls
 * into the group derived from its title, so nothing goes missing here.
 */
export default function Collections({
  paintings,
  onEdit,
}: {
  paintings: Painting[];
  onEdit: (painting: Painting) => void;
}) {
  const groups = useMemo(() => {
    const byName = new Map<string, Painting[]>();
    paintings.forEach((p) => {
      const name = collectionOf(p);
      byName.set(name, [...(byName.get(name) ?? []), p]);
    });
    return Array.from(byName.entries())
      .map(([name, works]) => ({
        name,
        works,
        assigned: works.filter((w) => w.collection?.trim()).length,
      }))
      .sort((a, b) => b.works.length - a.works.length);
  }, [paintings]);

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="max-w-[640px] rounded-[12px] border border-m-line bg-white px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
        Nommez la série d&apos;une œuvre dans sa fiche. Sans nom, elle est classée
        automatiquement d&apos;après son titre.
      </div>

      <div className="mt-[22px] grid grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group.name}
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
              {group.assigned === 0 && (
                <span className="shrink-0 rounded-full border border-m-line-strong px-2.5 py-1 text-[10px] uppercase tracking-[.12em] text-m-stone-soft">
                  Auto
                </span>
              )}
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
