"use client";

import { Painting } from "@/data/paintings";
import { catalogueValue, formatPrice } from "@/lib/mobile";
import { Enquiry, EnquiryStatus } from "@/lib/enquiries";
import { AdminView } from "../types";

interface BordProps {
  paintings: Painting[];
  enquiries: Enquiry[];
  onView: (view: AdminView) => void;
  onEdit: (painting: Painting) => void;
  onOpenInquiry: (id: string) => void;
}

const STATUS_STYLE: Record<EnquiryStatus, { label: string; color: string; border: string }> = {
  new: { label: "Nouveau", color: "text-m-sage", border: "border-m-sage-soft" },
  replied: { label: "Répondu", color: "text-m-stone", border: "border-m-line-strong" },
  closed: { label: "Clos", color: "text-m-stone-soft", border: "border-[#EFEAE0]" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "long" });

export default function Bord({
  paintings,
  enquiries,
  onView,
  onEdit,
  onOpenInquiry,
}: BordProps) {
  const available = paintings.filter((p) => !p.sold);
  const sold = paintings.length - available.length;
  const newCount = enquiries.filter((e) => e.status === "new").length;

  // Newest works first, which is the order the catalogue itself is kept in.
  const recentWorks = paintings.slice(0, 5);

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

      <div className="mt-4 grid grid-cols-[1fr_1fr] gap-4">
        <div className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[17px] font-normal">Demandes récentes</h2>
            <button onClick={() => onView("demandes")} className="text-[13px] text-m-sage">
              Tout voir
            </button>
          </div>

          {enquiries.length === 0 ? (
            <p className="mt-4 font-editorial text-[16px] italic leading-[1.6] text-m-stone">
              Aucune demande pour le moment. Les messages envoyés depuis le site
              apparaîtront ici.
            </p>
          ) : (
            <>
              <div className="mt-1 text-[12px] text-m-stone">
                {newCount === 0
                  ? "Aucune nouvelle demande"
                  : `${newCount} nouvelle${newCount > 1 ? "s" : ""} à traiter`}
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {enquiries.slice(0, 4).map((enquiry) => {
                  const style = STATUS_STYLE[enquiry.status];
                  return (
                    <button
                      key={enquiry.id}
                      onClick={() => onOpenInquiry(enquiry.id)}
                      className="flex items-center gap-3 rounded-[11px] border border-[#EFEAE0] px-3.5 py-3 text-left transition-colors duration-300 hover:border-m-line-strong hover:bg-[#FCFBF8]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px]">{enquiry.name}</div>
                        <div className="mt-0.5 truncate text-[12px] text-m-stone">
                          {enquiry.subject ?? "Message"} · {formatDate(enquiry.createdAt)}
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
            </>
          )}
        </div>

        <div className="animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[17px] font-normal">En tête du catalogue</h2>
            <button onClick={() => onView("oeuvres")} className="text-[13px] text-m-sage">
              Réorganiser
            </button>
          </div>
          <div className="mt-1 text-[12px] text-m-stone">
            L&apos;ordre dans lequel les visiteurs voient les œuvres
          </div>
          <div className="mt-4 grid grid-cols-5 gap-3">
            {recentWorks.map((painting) => (
              <button key={painting.id} onClick={() => onEdit(painting)} className="group text-left">
                <div className="aspect-[4/5] overflow-hidden rounded-[10px] bg-m-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={painting.image}
                    alt={painting.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-[9px] truncate font-editorial text-[14px] italic">
                  {painting.title}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-m-stone">
                  {painting.sold ? "Vendue" : formatPrice(painting.price, "fr")}
                </div>
              </button>
            ))}
          </div>
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
      <div className={`mt-2.5 text-[38px] tracking-[-.03em] ${accent ? "text-m-sage" : ""}`}>
        {value}
      </div>
    </div>
  );
}
