"use client";

import { useState } from "react";
import { Painting } from "@/data/paintings";
import { DEMO_INQUIRIES, DemoInquiry, InquiryStatus } from "@/components/mobile/demo-data";
import DemoTag from "../DemoTag";

type Filter = "all" | InquiryStatus;

const FILTERS: [Filter, string][] = [
  ["all", "Toutes"],
  ["new", "Nouvelles"],
  ["replied", "Répondues"],
  ["closed", "Closes"],
];

const STATUS_STYLE: Record<InquiryStatus, { label: string; color: string; border: string }> = {
  new: { label: "Nouveau", color: "text-m-sage", border: "border-m-sage-soft" },
  replied: { label: "Répondu", color: "text-m-stone", border: "border-m-line-strong" },
  closed: { label: "Clos", color: "text-m-stone-soft", border: "border-[#EFEAE0]" },
};

interface DemandesProps {
  paintings: Painting[];
  openId: string | null;
  onOpenId: (id: string) => void;
  onToast: (message: string) => void;
}

export default function Demandes({ paintings, openId, onOpenId, onToast }: DemandesProps) {
  const [inquiries, setInquiries] = useState<DemoInquiry[]>(DEMO_INQUIRIES);
  const [filter, setFilter] = useState<Filter>("all");
  const [reply, setReply] = useState("");

  const rows = inquiries.filter((i) => filter === "all" || i.status === filter);
  const open = inquiries.find((i) => i.id === openId) ?? rows[0] ?? inquiries[0];
  const openPainting = open ? paintings.find((p) => p.id === open.paintingId) : undefined;

  const setStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    onToast("Statut mis à jour.");
  };

  const send = () => {
    if (!reply.trim()) return onToast("Écrivez une réponse d'abord.");
    if (open) setInquiries((prev) => prev.map((i) => (i.id === open.id ? { ...i, status: "replied" } : i)));
    setReply("");
    onToast("Réponse envoyée.");
  };

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <DemoTag className="mb-4" />

      <div className="flex gap-2">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full border px-[18px] py-[9px] text-[13px] transition-all duration-300 ${
              filter === key
                ? "border-m-ink bg-m-ink text-m-paper"
                : "border-m-line-strong bg-white text-m-stone-deep hover:border-m-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-[18px] grid grid-cols-[1.7fr_minmax(340px,1fr)] items-start gap-4">
        <div className="overflow-hidden rounded-[14px] border border-[#E9E4DA] bg-white">
          {rows.length === 0 ? (
            <div className="p-[60px] text-center font-editorial text-[18px] italic text-m-stone">
              Rien dans ce filtre.
            </div>
          ) : (
            rows.map((inquiry) => {
              const style = STATUS_STYLE[inquiry.status];
              const painting = paintings.find((p) => p.id === inquiry.paintingId);
              return (
                <button
                  key={inquiry.id}
                  onClick={() => onOpenId(inquiry.id)}
                  className={`grid w-full grid-cols-[52px_minmax(0,1fr)_104px] items-center gap-4 border-b border-[#F3EFE7] px-5 py-4 text-left transition-colors duration-200 ${
                    open?.id === inquiry.id ? "bg-[#FCFBF8]" : "hover:bg-[#FCFBF8]"
                  }`}
                >
                  <div className="h-[52px] w-[52px] overflow-hidden rounded-[9px] bg-m-sand">
                    {painting && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={painting.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[15px]">{inquiry.name}</div>
                    <div className="mt-0.5 truncate text-[13px] text-m-stone">
                      {painting?.title ?? inquiry.kind.fr} · {inquiry.subject.fr}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-[5px] text-center text-[10px] uppercase tracking-[.14em] ${style.color} ${style.border}`}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {open && (
          <div className="sticky top-[104px] animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
            <div className="text-[11px] uppercase tracking-[.16em] text-m-stone">
              {open.kind.fr}
            </div>
            <h3 className="m-0 mt-2.5 text-[22px] font-normal">{open.name}</h3>
            <div className="mt-1 text-[13px] text-m-stone">{open.email}</div>
            {openPainting && (
              <div className="mt-3 flex items-center gap-2.5 rounded-[10px] border border-[#EFEAE0] p-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-m-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={openPainting.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="truncate font-editorial text-[15px] italic">
                  {openPainting.title}
                </span>
              </div>
            )}

            <p className="mt-5 font-editorial text-[17px] leading-[1.65] text-[#3A3833]">
              {open.message.fr}
            </p>

            <div className="mt-[22px] flex flex-wrap gap-2">
              {(["new", "replied", "closed"] as InquiryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(open.id, status)}
                  aria-pressed={open.status === status}
                  className={`rounded-full border px-4 py-[9px] text-[12px] transition-all duration-300 ${
                    open.status === status
                      ? "border-m-ink bg-m-ink text-m-paper"
                      : "border-m-line-strong bg-transparent"
                  }`}
                >
                  {STATUS_STYLE[status].label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Répondre à cette personne…"
              className="mt-[18px] w-full resize-y rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
            />
            <button
              onClick={send}
              className="mt-3 w-full rounded-full bg-m-ink py-3.5 text-[14px] text-m-paper"
            >
              Envoyer la réponse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
