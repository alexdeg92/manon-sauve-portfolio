"use client";

import { useState } from "react";
import { Painting } from "@/data/paintings";
import { EnquiryStatus, EnquiryWithThread } from "@/lib/enquiries";
import { useSite } from "@/components/site/context";
import Sheet from "../Sheet";
import SwipeRow from "../SwipeRow";
import PaintingImage from "@/components/site/PaintingImage";
import { StatusPill } from "./Bord";

type Filter = "all" | EnquiryStatus;

interface DemandesProps {
  enquiries: EnquiryWithThread[];
  paintings: Painting[];
  onStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  onReply: (id: string, body: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

export default function Demandes({
  enquiries,
  paintings,
  onStatus,
  onReply,
  onDelete,
}: DemandesProps) {
  const { lang, t, say } = useSite();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const shown = enquiries.filter((e) => filter === "all" || e.status === filter);
  const current = enquiries.find((e) => e.id === openId) ?? null;
  const currentPainting = current?.paintingId
    ? paintings.find((p) => p.id === current.paintingId)
    : undefined;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-CA" : "fr-CA", {
      day: "numeric",
      month: "long",
    });

  const send = async () => {
    if (!current) return;
    if (!reply.trim()) return say(t("Écrivez une réponse d'abord.", "Write a reply first."));

    setSending(true);
    const ok = await onReply(current.id, reply.trim());
    setSending(false);
    if (ok) {
      setReply("");
      setOpenId(null);
    }
  };

  const waiting = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Demandes", "Inquiries")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {enquiries.length === 0
            ? t("Aucune demande pour le moment.", "No inquiries yet.")
            : lang === "en"
              ? `${waiting} still waiting for a reply.`
              : `${waiting} sont encore sans réponse.`}
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="px-6 pt-8">
          <div className="rounded-[16px] border border-m-line bg-white px-5 py-8 text-center">
            <p className="m-0 font-editorial text-[16px] italic leading-[1.6] text-m-stone">
              {t(
                "Les messages envoyés depuis le site apparaîtront ici.",
                "Messages sent from the site will appear here."
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
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
              {shown.map((enquiry) => {
                const painting = enquiry.paintingId
                  ? paintings.find((p) => p.id === enquiry.paintingId)
                  : undefined;
                return (
                  <SwipeRow
                    key={enquiry.id}
                    rightActionLabel={t("Non lue", "Unread")}
                    onSwipeRight={() => onStatus(enquiry.id, "new")}
                    leftActionLabel={t("Supprimer", "Delete")}
                    onSwipeLeft={() => onDelete(enquiry.id)}
                    destructive="left"
                  >
                  <button
                    onClick={() => setOpenId(enquiry.id)}
                    className={`flex w-full items-center gap-[13px] rounded-[16px] border border-m-line bg-white p-3.5 text-left ${
                      enquiry.status === "closed" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-m-sand">
                      {painting ? (
                        <PaintingImage src={painting.image} alt="" sizes="48px" />
                      ) : (
                        <span className="font-editorial text-[16px] italic text-m-stone-soft">
                          {enquiry.name.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px]">{enquiry.name}</div>
                      <div className="mt-0.5 truncate text-[12px] text-m-stone">
                        {enquiry.subject ?? t("Message", "Message")} ·{" "}
                        {formatDate(enquiry.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={enquiry.status} />
                  </button>
                  </SwipeRow>
                );
              })}
            </div>
          )}
        </>
      )}

      <Sheet open={Boolean(current)} onClose={() => setOpenId(null)}>
        {current && (
          <div className="px-6 pb-[30px] pt-3">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-m-sand">
                {currentPainting ? (
                  <PaintingImage src={currentPainting.image} alt="" sizes="52px" />
                ) : (
                  <span className="font-editorial text-[17px] italic text-m-stone-soft">
                    {current.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[.18em] text-m-sage">
                  {current.subject ?? t("Message", "Message")}
                </div>
                <div className="mt-1 text-[19px]">{current.name}</div>
                <div className="mt-0.5 truncate text-[12px] text-m-stone">
                  <a href={`mailto:${current.email}`}>{current.email}</a>
                </div>
              </div>

              {/* Status is derived — new until answered, répondu once a reply
                  goes out. Closing is the only judgement call. */}
              <button
                onClick={() =>
                  onStatus(current.id, current.status === "closed" ? "new" : "closed")
                }
                className="shrink-0 self-start rounded-full border border-m-line-strong px-3 py-1.5 text-[11px] text-m-stone"
              >
                {current.status === "closed"
                  ? t("Rouvrir", "Reopen")
                  : t("Clore", "Close case")}
              </button>
            </div>

            {current.phone && (
              <div className="mt-2 text-[12px] text-m-stone">
                <a href={`tel:${current.phone}`}>{current.phone}</a>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              {(current.messages?.length
                ? current.messages
                : [
                    {
                      id: "first",
                      direction: "inbound" as const,
                      body: current.message,
                      createdAt: current.createdAt,
                    },
                  ]
              ).map((message) => (
                <div
                  key={message.id}
                  className={
                    message.direction === "outbound"
                      ? "rounded-[12px] border border-m-sage-soft bg-[#F6F8F5] px-4 py-3"
                      : "rounded-[12px] border border-m-line px-4 py-3"
                  }
                >
                  <div className="text-[10px] uppercase tracking-[.14em] text-m-stone-soft">
                    {message.direction === "outbound"
                      ? t("Votre réponse", "Your reply")
                      : current.name}{" "}
                    · {formatDate(message.createdAt)}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap font-editorial text-[16px] leading-[1.6] text-[#3A3833]">
                    {message.body}
                  </p>
                </div>
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
                disabled={sending}
                className="flex-1 rounded-full bg-m-ink py-4 text-[14px] text-m-paper disabled:opacity-60"
              >
                {sending ? t("Envoi…", "Sending…") : t("Envoyer la réponse", "Send reply")}
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
