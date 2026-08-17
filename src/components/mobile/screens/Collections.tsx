"use client";

import { useMemo } from "react";
import { Painting } from "@/data/paintings";
import { collectionOf } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import PaintingImage from "@/components/site/PaintingImage";
import SubScreen from "./SubScreen";

/**
 * A collection is a name written on each work, not a record of its own, so this
 * groups the real catalogue instead of maintaining a separate list. Renaming a
 * series means editing the works in it.
 */
export default function Collections({
  paintings,
  onBack,
}: {
  paintings: Painting[];
  onBack: () => void;
}) {
  const { lang, t } = useSite();

  const groups = useMemo(() => {
    const byName = new Map<string, Painting[]>();
    paintings.forEach((p) => {
      const name = collectionOf(p, lang);
      byName.set(name, [...(byName.get(name) ?? []), p]);
    });
    return Array.from(byName.entries())
      .map(([name, works]) => ({
        name,
        works,
        assigned: works.filter((w) => w.collection?.trim()).length,
      }))
      .sort((a, b) => b.works.length - a.works.length);
  }, [paintings, lang]);

  return (
    <SubScreen title={t("Collections", "Collections")} onBack={onBack}>
      <div className="px-6 pt-4">
        <p className="m-0 rounded-[12px] border border-m-line bg-white px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
          {t(
            "Nommez la série d'une œuvre dans sa fiche. Sans nom, elle est classée automatiquement d'après son titre.",
            "Name a work's series on its own card. Without one, it is grouped automatically from its title."
          )}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="px-6 py-[50px] text-center font-editorial italic text-m-stone">
          {t("Aucune œuvre au catalogue.", "No works in the catalogue.")}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-6 pt-[18px]">
          {groups.map((group) => (
            <div
              key={group.name}
              className="animate-mRise rounded-[16px] border border-m-line bg-white p-[18px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-editorial text-[20px] italic">{group.name}</div>
                  <div className="mt-1 text-[12px] text-m-stone">
                    {lang === "en"
                      ? `${group.works.length} ${group.works.length > 1 ? "works" : "work"} · ${
                          group.works.filter((w) => !w.sold).length
                        } available`
                      : `${group.works.length} ${
                          group.works.length > 1 ? "œuvres" : "œuvre"
                        } · ${group.works.filter((w) => !w.sold).length} disponible${
                          group.works.filter((w) => !w.sold).length > 1 ? "s" : ""
                        }`}
                  </div>
                </div>
                {group.assigned === 0 && (
                  <span className="shrink-0 rounded-full border border-m-line-strong px-[11px] py-[6px] text-[10px] uppercase tracking-[.12em] text-m-stone-soft">
                    {t("Auto", "Auto")}
                  </span>
                )}
              </div>

              <div className="mt-3.5 flex gap-1.5">
                {group.works.slice(0, 4).map((work) => (
                  <div
                    key={work.id}
                    className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[8px] bg-m-sand"
                  >
                    <PaintingImage src={work.image} alt={work.title} sizes="80px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  );
}
