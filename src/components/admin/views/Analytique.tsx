"use client";

import { Painting } from "@/data/paintings";
import { ANALYTICS_CARDS, SOURCES, viewsFor } from "../demo-data";
import DemoTag from "../DemoTag";

export default function Analytique({ paintings }: { paintings: Painting[] }) {
  const ranked = [...paintings]
    .sort((a, b) => viewsFor(b.id) - viewsFor(a.id))
    .slice(0, 6);
  const maxViews = Math.max(1, ...ranked.map((p) => viewsFor(p.id)));

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <DemoTag className="mb-4" />

      <div className="grid grid-cols-4 gap-4">
        {ANALYTICS_CARDS.map((card) => (
          <div
            key={card.label}
            className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-[22px]"
          >
            <div className="text-[11px] uppercase tracking-[.16em] text-m-stone">{card.label}</div>
            <div className="mt-2.5 text-[34px] tracking-[-.03em]">{card.value}</div>
            <div className="mt-1.5 text-[12px] text-m-sage">{card.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
          <h2 className="m-0 mb-5 text-[17px] font-normal">Œuvres les plus consultées</h2>
          {ranked.map((painting) => (
            <Row
              key={painting.id}
              label={painting.title}
              value={String(viewsFor(painting.id))}
              pct={Math.round((viewsFor(painting.id) / maxViews) * 100)}
              color="#4A6B4F"
            />
          ))}
        </div>

        <div className="rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
          <h2 className="m-0 mb-5 text-[17px] font-normal">Provenance des visiteurs</h2>
          {SOURCES.map((source) => (
            <Row
              key={source.label}
              label={source.label}
              value={`${source.pct} %`}
              pct={source.pct}
              color="#17181A"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_62px] items-center gap-3.5 py-[11px]">
      <div>
        <div className="truncate text-[14px]">{label}</div>
        <div className="mt-2 h-[7px] overflow-hidden rounded-[4px] bg-[#F0ECE3]">
          <div
            className="h-full rounded-[4px] transition-[width] duration-700"
            style={{
              width: `${pct}%`,
              background: color,
              transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
            }}
          />
        </div>
      </div>
      <span className="text-right text-[13px] text-m-stone">{value}</span>
    </div>
  );
}
