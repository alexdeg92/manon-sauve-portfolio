"use client";

import { useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { DEMO_ANALYTICS } from "../demo-data";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import DemoNote from "../DemoNote";
import SubScreen from "./SubScreen";

export default function Analytique({
  paintings,
  onBack,
}: {
  paintings: Painting[];
  onBack: () => void;
}) {
  const { lang, t } = useSite();
  // Bars grow from zero once mounted, as the design animates on screen entry.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <SubScreen title={t("Analytique", "Analytics")} onBack={onBack}>
      <div className="px-6 pt-4">
        <DemoNote />
      </div>

      <Reveal>
        <div className="grid grid-cols-2 gap-3 px-6 pt-5">
          <Tile value={DEMO_ANALYTICS.visits} label={t("visites, 30 jours", "visits, 30 days")} />
          <Tile value={DEMO_ANALYTICS.pagesPerVisit} label={t("pages par visite", "pages per visit")} />
          <Tile value={DEMO_ANALYTICS.inquiries} label={t("demandes", "inquiries")} />
          <Tile value={DEMO_ANALYTICS.inquiryRate} label={t("taux de demande", "inquiry rate")} accent />
        </div>
      </Reveal>

      <Reveal index={1} className="mx-6 mt-4">
        <div className="rounded-[16px] border border-m-line bg-white p-5">
          <h2 className="m-0 mb-3.5 text-[16px] font-normal">
            {t("Œuvres les plus vues", "Most viewed works")}
          </h2>
          {DEMO_ANALYTICS.mostViewed.map((row) => {
            const painting = paintings.find((p) => p.id === row.paintingId);
            return (
              <Bar
                key={row.paintingId}
                label={painting?.title ?? row.paintingId}
                value={String(row.views)}
                weight={grown ? row.weight : 0}
                color="#4A6B4F"
              />
            );
          })}
        </div>
      </Reveal>

      <Reveal index={2} className="mx-6 mt-4">
        <div className="rounded-[16px] border border-m-line bg-white p-5">
          <h2 className="m-0 mb-3.5 text-[16px] font-normal">
            {t("Provenance des visiteurs", "Where visitors come from")}
          </h2>
          {DEMO_ANALYTICS.sources.map((row) => (
            <Bar
              key={row.label.fr}
              label={row.label[lang]}
              value={row.value}
              weight={grown ? row.weight : 0}
              color="#17181A"
            />
          ))}
        </div>
      </Reveal>
    </SubScreen>
  );
}

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-[16px] border border-m-line bg-white p-[18px]">
      <div className={`text-[26px] tracking-[-.02em] ${accent ? "text-m-sage" : ""}`}>{value}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[.14em] text-m-stone">{label}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  weight,
  color,
}: {
  label: string;
  value: string;
  weight: number;
  color: string;
}) {
  return (
    <div className="py-2">
      <div className="flex justify-between gap-3 text-[13px]">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-m-stone">{value}</span>
      </div>
      <div className="mt-[7px] h-1.5 overflow-hidden rounded-[3px] bg-[#F0ECE3]">
        <div
          className="h-full rounded-[3px] transition-[width] duration-1000"
          style={{
            width: `${weight}%`,
            background: color,
            transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
          }}
        />
      </div>
    </div>
  );
}
