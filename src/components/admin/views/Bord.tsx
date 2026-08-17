"use client";

import { Painting } from "@/data/paintings";
import { catalogueValue, formatPrice } from "@/lib/mobile";
import { DEMO_INQUIRIES } from "@/components/mobile/demo-data";
import { TRAFFIC, viewsFor } from "../demo-data";
import DemoTag from "../DemoTag";
import { AdminView } from "../types";

interface BordProps {
  paintings: Painting[];
  onView: (view: AdminView) => void;
  onEdit: (painting: Painting) => void;
  onOpenInquiry: (id: string) => void;
}

const STATUS_STYLE = {
  new: { label: "Nouveau", color: "text-m-sage", border: "border-m-sage-soft" },
  replied: { label: "Répondu", color: "text-m-stone", border: "border-m-line-strong" },
  closed: { label: "Clos", color: "text-m-stone-soft", border: "border-[#EFEAE0]" },
};

export default function Bord({ paintings, onView, onEdit, onOpenInquiry }: BordProps) {
  const available = paintings.filter((p) => !p.sold);
  const sold = paintings.length - available.length;
  const maxTraffic = Math.max(...TRAFFIC);

  const topWorks = [...paintings]
    .sort((a, b) => viewsFor(b.id) - viewsFor(a.id))
    .slice(0, 5);

  return (
    <div className="animate-mFade px-[38px] py-8">
      <div className="grid grid-cols-4 gap-4">
        <Card label="Œuvres au catalogue" value={String(paintings.length)} />
        <Card label="Disponibles" value={String(available.length)} accent />
        <Card label="Vendues" value={String(sold)} />
        <Card
          label="Valeur disponible"
          value={formatPrice(catalogueValue(paintings), "fr")}
          dark
        />
      </div>

      <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-4">
        <div className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[17px] font-normal">Visites du site</h2>
            <span className="text-[12px] text-m-stone">14 derniers jours</span>
          </div>
          <DemoTag className="mt-3" />
          <div className="mt-5 flex h-[170px] items-end gap-[9px]">
            {TRAFFIC.map((n, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div
                  title={`${n} visites`}
                  style={{ height: `${Math.round((n / maxTraffic) * 100)}%` }}
                  className="origin-bottom rounded-t-[5px] bg-m-sage transition-colors duration-300 hover:bg-m-ink"
                />
                <div className="text-center text-[10px] text-m-stone-soft">{4 + i}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[17px] font-normal">Demandes récentes</h2>
            <button onClick={() => onView("demandes")} className="text-[13px] text-m-sage">
              Tout voir
            </button>
          </div>
          <DemoTag className="mt-3" />
          <div className="mt-4 flex flex-col gap-2.5">
            {DEMO_INQUIRIES.slice(0, 3).map((inquiry) => {
              const style = STATUS_STYLE[inquiry.status];
              return (
                <button
                  key={inquiry.id}
                  onClick={() => onOpenInquiry(inquiry.id)}
                  className="flex items-center gap-3 rounded-[11px] border border-[#EFEAE0] px-3.5 py-3 text-left transition-colors duration-300 hover:border-m-line-strong hover:bg-[#FCFBF8]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px]">{inquiry.name}</div>
                    <div className="mt-0.5 truncate text-[12px] text-m-stone">
                      {inquiry.kind.fr} · {inquiry.subject.fr}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-[9px] py-1 text-[10px] uppercase tracking-[.14em] ${style.color} ${style.border}`}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 text-[17px] font-normal">Œuvres les plus vues</h2>
          <DemoTag inline>compteurs de vues fictifs</DemoTag>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-4">
          {topWorks.map((painting) => (
            <button key={painting.id} onClick={() => onEdit(painting)} className="group text-left">
              <div className="aspect-[4/5] overflow-hidden rounded-[10px] bg-m-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={painting.image}
                  alt={painting.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="mt-[9px] truncate font-editorial text-[16px] italic">
                {painting.title}
              </div>
              <div className="mt-0.5 text-[12px] text-m-stone">{viewsFor(painting.id)} vues</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  accent,
  dark,
}: {
  label: string;
  value: string;
  accent?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`animate-mRise rounded-[14px] p-[22px] ${
        dark ? "bg-m-ink text-m-paper" : "border border-[#E9E4DA] bg-white"
      }`}
    >
      <div
        className={`text-[11px] uppercase tracking-[.16em] ${dark ? "text-[#9DB3A1]" : "text-m-stone"}`}
      >
        {label}
      </div>
      <div
        className={`mt-2.5 text-[38px] tracking-[-.03em] ${accent ? "text-m-sage" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
