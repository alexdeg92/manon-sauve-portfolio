"use client";

import { useState } from "react";
import { Painting } from "@/data/paintings";
import { EnquiryStatus, EnquiryWithThread } from "@/lib/enquiries";

type Filter = "all" | EnquiryStatus;

const FILTERS: [Filter, string][] = [
  ["all", "Toutes"],
  ["new", "Nouvelles"],
  ["replied", "Répondues"],
  ["closed", "Closes"],
];

const STATUS_STYLE: Record<EnquiryStatus, { label: string; color: string; border: string }> = {
  new: { label: "Nouveau", color: "text-m-sage", border: "border-m-sage-soft" },
  replied: { label: "Répondu", color: "text-m-stone", border: "border-m-line-strong" },
  closed: { label: "Clos", color: "text-m-stone-soft", border: "border-[#EFEAE0]" },
};

/** "17 août", matching how the rest of the portal writes dates. */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "long" });

interface DemandesProps {
  enquiries: EnquiryWithThread[];
  paintings: Painting[];
  openId: string | null;
  onOpenId: (id: string) => void;
  onStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  onReply: (id: string, body: string) => Promise<boolean>;
  onToast: (message: string) => void;
}

export default function Demandes({
  enquiries,
  paintings,
  openId,
  onOpenId,
  onStatus,
  onReply,
  onToast,
}: DemandesProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const rows = enquiries.filter((e) => filter === "all" || e.status === filter);
  const open = enquiries.find((e) => e.id === openId) ?? rows[0] ?? enquiries[0];
  const openPainting = open?.paintingId
    ? paintings.find((p) => p.id === open.paintingId)
    : undefined;

  const send = async () => {
    if (!open) return;
    if (!reply.trim()) return onToast("Écrivez une réponse d'abord.");

    setSending(true);
    const ok = await onReply(open.id, reply.trim());
    setSending(false);
    if (ok) setReply("");
  };

  if (enquiries.length === 0) {
    return (
      <div className="animate-mFade px-[38px] py-[26px]">
        <div className="rounded-[14px] border border-[#E9E4DA] bg-white p-[60px] text-center">
          <div className="font-editorial text-[20px] italic text-m-stone">
            Aucune demande pour le moment.
          </div>
          <p className="mx-auto mt-3 max-w-[420px] text-[13px] leading-[1.6] text-m-stone-soft">
            Les messages envoyés depuis le site — questions sur une œuvre, commandes,
            visites d&apos;atelier et inscriptions à l&apos;infolettre — apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="flex gap-2">
        {FILTERS.map(([key, label]) => {
          const count =
            key === "all" ? enquiries.length : enquiries.filter((e) => e.status === key).length;
          return (
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
              <span className={filter === key ? "text-m-paper/60" : "text-m-stone-soft"}>
                {" "}
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-[18px] grid grid-cols-[1.7fr_minmax(340px,1fr)] items-start gap-4">
        <div className="overflow-hidden rounded-[14px] border border-[#E9E4DA] bg-white">
          {rows.length === 0 ? (
            <div className="p-[60px] text-center font-editorial text-[18px] italic text-m-stone">
              Rien dans ce filtre.
            </div>
          ) : (
            rows.map((enquiry) => {
              const style = STATUS_STYLE[enquiry.status];
              const painting = enquiry.paintingId
                ? paintings.find((p) => p.id === enquiry.paintingId)
                : undefined;
              return (
                <button
                  key={enquiry.id}
                  onClick={() => onOpenId(enquiry.id)}
                  className={`grid w-full grid-cols-[52px_minmax(0,1fr)_104px] items-center gap-4 border-b border-[#F3EFE7] px-5 py-4 text-left transition-colors duration-200 ${
                    open?.id === enquiry.id ? "bg-[#FCFBF8]" : "hover:bg-[#FCFBF8]"
                  }`}
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[9px] bg-m-sand">
                    {painting ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={painting.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-editorial text-[17px] italic text-m-stone-soft">
                        {enquiry.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[15px]">{enquiry.name}</div>
                    <div className="mt-0.5 truncate text-[13px] text-m-stone">
                      {enquiry.subject ?? "Message"} · {formatDate(enquiry.createdAt)}
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
          <div className="sticky top-[104px] animate-mRise relative rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
            {/* Status is derived — new until answered, répondu once a reply is
                sent. Closing is the only judgement call, so it is the only
                control here. */}
            <button
              onClick={() => onStatus(open.id, open.status === "closed" ? "new" : "closed")}
              title={open.status === "closed" ? "Rouvrir le dossier" : "Clore le dossier"}
              className="absolute right-4 top-4 rounded-full border border-m-line-strong px-3 py-1.5 text-[11px] text-m-stone transition-colors duration-300 hover:border-m-ink hover:text-m-ink"
            >
              {open.status === "closed" ? "Rouvrir" : "Clore"}
            </button>

            <div className="pr-[76px] text-[11px] uppercase tracking-[.16em] text-m-stone">
              {open.subject ?? "Message"}
            </div>
            <h3 className="m-0 mt-2.5 text-[22px] font-normal">{open.name}</h3>
            <div className="mt-1 text-[13px] text-m-stone">
              <a href={`mailto:${open.email}`} className="hover:text-m-ink">
                {open.email}
              </a>
              {open.phone && <> · {open.phone}</>}
            </div>
            <div className="mt-1 text-[12px] text-m-stone-soft">
              Reçu le {formatDate(open.createdAt)}
            </div>

            {openPainting && (
              <div className="mt-3 flex items-center gap-2.5 rounded-[10px] border border-[#EFEAE0] p-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-m-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={openPainting.image} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="truncate font-editorial text-[15px] italic">
                  {openPainting.title}
                </span>
              </div>
            )}

            {/* The conversation: the visitor's first message, Manon's replies,
                and anything they wrote back via Resend receiving. */}
            <div className="mt-5 flex flex-col gap-3">
              {(open.messages?.length
                ? open.messages
                : [
                    {
                      id: "first",
                      direction: "inbound" as const,
                      body: open.message,
                      createdAt: open.createdAt,
                    },
                  ]
              ).map((message) => (
                <div
                  key={message.id}
                  className={
                    message.direction === "outbound"
                      ? "rounded-[11px] border border-m-sage-soft bg-[#F6F8F5] px-4 py-3"
                      : "rounded-[11px] border border-[#EFEAE0] px-4 py-3"
                  }
                >
                  <div className="text-[10px] uppercase tracking-[.14em] text-m-stone-soft">
                    {message.direction === "outbound" ? "Votre réponse" : open.name} ·{" "}
                    {formatDate(message.createdAt)}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap font-editorial text-[16px] leading-[1.6] text-[#3A3833]">
                    {message.body}
                  </p>
                </div>
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
              disabled={sending}
              className="mt-3 w-full rounded-full bg-m-ink py-3.5 text-[14px] text-m-paper disabled:opacity-60"
            >
              {sending ? "Envoi…" : `Envoyer la réponse à ${open.name.split(" ")[0]}`}
            </button>
            <p className="mt-2.5 text-center text-[11px] text-m-stone-soft">
              Envoyée depuis contact@manonsauve.art
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
