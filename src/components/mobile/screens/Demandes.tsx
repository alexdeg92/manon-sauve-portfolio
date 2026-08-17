"use client";

import { useState } from "react";
import { Painting } from "@/data/paintings";
import { DEMO_INQUIRIES, DemoInquiry, InquiryStatus } from "../demo-data";
import { useSite } from "@/components/site/context";
import Sheet from "../Sheet";
import PaintingImage from "@/components/site/PaintingImage";
import DemoNote from "../DemoNote";
import { StatusPill } from "./Bord";

type Filter = "all" | InquiryStatus;

export default function Demandes({ paintings }: { paintings: Painting[] }) {
  const { lang, t, say } = useSite();
  const [inquiries, setInquiries] = useState<DemoInquiry[]>(DEMO_INQUIRIES);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const shown = inquiries.filter((i) => filter === "all" || i.status === filter);
  const current = inquiries.find((i) => i.id === openId) ?? null;
  const currentPainting = current
    ? paintings.find((p) => p.id === current.paintingId)
    : undefined;

  const setStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    say(t("Statut mis à jour.", "Status updated."));
  };

  const send = () => {
    if (!reply.trim()) return say(t("Écrivez une réponse d'abord.", "Write a reply first."));
    if (current) setInquiries((prev) => prev.map((i) => (i.id === current.id ? { ...i, status: "replied" } : i)));
    setReply("");
    setOpenId(null);
    say(t("Réponse envoyée.", "Reply sent."));
  };

  const waiting = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Demandes", "Inquiries")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {lang === "en"
            ? `${waiting} still waiting for a reply.`
            : `${waiting} sont encore sans réponse.`}
        </p>
      </div>

      <div className="px-6 pt-4">
        <DemoNote />
      </div>

      <div className="m-rail flex gap-2 overflow-x-auto px-6 pb-1 pt-[18px]">
        {(
          [
            ["all", t("Toutes", "All")],
            ["new", t("Nouvelles", "New")],
            ["replied", t("Répondues", "Replied")],
            ["closed", t("Closes", "Closed")],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`shrink-0 rounded-full border px-[17px] py-[9px] text-[13px] transition-all duration-300 ${
              filter === key
                ? "border-m-ink bg-m-ink text-m-paper"
                : "border-m-line-strong bg-transparent text-m-stone-deep"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="px-6 py-[50px] text-center font-editorial italic text-m-stone">
          {t("Rien dans ce filtre.", "Nothing in this filter.")}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-6 pt-5">
          {shown.map((inquiry) => {
            const painting = paintings.find((p) => p.id === inquiry.paintingId);
            return (
              <button
                key={inquiry.id}
                onClick={() => setOpenId(inquiry.id)}
                className={`flex items-center gap-[13px] rounded-[16px] border border-m-line bg-white p-3.5 text-left ${
                  inquiry.status === "closed" ? "opacity-60" : ""
                }`}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-m-sand">
                  {painting && <PaintingImage src={painting.image} alt="" sizes="48px" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px]">{inquiry.name}</div>
                  <div className="mt-0.5 truncate text-[12px] text-m-stone">
                    {painting?.title ?? inquiry.kind[lang]} · {inquiry.subject[lang]}
                  </div>
                </div>
                <StatusPill status={inquiry.status} />
              </button>
            );
          })}
        </div>
      )}

      <Sheet open={Boolean(current)} onClose={() => setOpenId(null)}>
        {current && (
          <div className="px-6 pb-[30px] pt-3">
            <div className="flex items-center gap-3.5">
              <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[11px] bg-m-sand">
                {currentPainting && (
                  <PaintingImage src={currentPainting.image} alt="" sizes="52px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[.18em] text-m-sage">
                  {current.kind[lang]}
                </div>
                <div className="mt-1 text-[19px]">{current.name}</div>
                <div className="mt-0.5 truncate text-[12px] text-m-stone">{current.email}</div>
              </div>
            </div>

            <p className="mt-5 font-editorial text-[17px] leading-[1.65] text-[#3A3833]">
              {current.message[lang]}
            </p>

            <div className="mt-5 flex gap-2">
              {(["new", "replied", "closed"] as InquiryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(current.id, status)}
                  aria-pressed={current.status === status}
                  className={`flex-1 rounded-full border py-[11px] text-[12px] transition-all duration-300 ${
                    current.status === status
                      ? "border-m-ink bg-m-ink text-m-paper"
                      : "border-m-line-strong bg-transparent"
                  }`}
                >
                  {status === "new"
                    ? t("Nouveau", "New")
                    : status === "replied"
                      ? t("Répondu", "Replied")
                      : t("Clos", "Closed")}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t("Répondre…", "Reply…")}
              className="mt-3.5 w-full resize-none rounded-[12px] border border-m-line-strong bg-white px-4 py-3.5 text-[14px] outline-none placeholder:text-m-stone-soft focus:border-m-sage"
            />

            <div className="mt-3 flex gap-2.5">
              <button
                onClick={send}
                className="flex-1 rounded-full bg-m-ink py-4 text-[14px] text-m-paper"
              >
                {t("Envoyer la réponse", "Send reply")}
              </button>
              <button
                onClick={() => setOpenId(null)}
                className="rounded-full border border-m-line-strong px-5 py-4 text-[14px]"
              >
                {t("Fermer", "Close")}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
