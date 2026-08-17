"use client";

import { Painting } from "@/data/paintings";
import { catalogueValue, formatPrice } from "@/lib/mobile";
import { Enquiry } from "@/lib/enquiries";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";
import type { ScreenName } from "../nav";

interface BordProps {
  paintings: Painting[];
  enquiries: Enquiry[];
  onGoto: (screen: ScreenName) => void;
}

export default function Bord({ paintings, enquiries, onGoto }: BordProps) {
  const { lang, t } = useSite();

  const available = paintings.filter((p) => !p.sold).length;
  const sold = paintings.length - available;
  const value = catalogueValue(paintings);
  const newCount = enquiries.filter((e) => e.status === "new").length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-CA" : "fr-CA", {
      day: "numeric",
      month: "long",
    });

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Aujourd'hui", "Today")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {enquiries.length === 0
            ? t("Aucune demande pour le moment.", "No inquiries yet.")
            : lang === "en"
              ? `${newCount} new inquiries waiting.`
              : `${newCount} nouvelles demandes en attente.`}
        </p>
      </div>

      <Reveal>
        <div className="grid grid-cols-2 gap-3 px-6 pt-[22px]">
          <Tile value={String(paintings.length)} label={t("œuvres", "works")} />
          <Tile value={String(available)} label={t("disponibles", "available")} accent />
          <Tile value={String(sold)} label={t("vendues", "sold")} />
          <Tile value={formatPrice(value, lang)} label={t("valeur catalogue", "catalogue value")} />
        </div>
      </Reveal>

      <Reveal index={1}>
        <div className="px-6 pt-[30px]">
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="m-0 text-[19px] font-normal">{t("Demandes", "Inquiries")}</h2>
            <button onClick={() => onGoto("demandes")} className="text-[13px] text-m-sage">
              {t("Tout voir", "See all")}
            </button>
          </div>
          {enquiries.length === 0 ? (
            <p className="m-0 rounded-[16px] border border-m-line px-[18px] py-5 font-editorial text-[15px] italic leading-[1.6] text-m-stone">
              {t(
                "Les messages envoyés depuis le site apparaîtront ici.",
                "Messages sent from the site will appear here."
              )}
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {enquiries.slice(0, 3).map((enquiry) => {
                const painting = enquiry.paintingId
                  ? paintings.find((p) => p.id === enquiry.paintingId)
                  : undefined;
                return (
                  <button
                    key={enquiry.id}
                    onClick={() => onGoto("demandes")}
                    className={`flex w-full items-center gap-3.5 rounded-[16px] border border-m-line px-[18px] py-4 text-left ${
                      enquiry.status === "closed" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-m-sand">
                      {painting ? (
                        <PaintingImage src={painting.image} alt="" sizes="44px" />
                      ) : (
                        <span className="font-editorial text-[15px] italic text-m-stone-soft">
                          {enquiry.name.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px]">{enquiry.name}</div>
                      <div className="mt-0.5 truncate text-[12px] text-m-stone">
                        {enquiry.subject ?? t("Message", "Message")} ·{" "}
                        {formatDate(enquiry.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={enquiry.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-[16px] border border-m-line p-[18px]">
      <div className={`text-[28px] tracking-[-.02em] ${accent ? "text-m-sage" : ""}`}>{value}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[.14em] text-m-stone">{label}</div>
    </div>
  );
}

export function StatusPill({
  status,
  unread,
}: {
  status: "new" | "replied" | "closed";
  /** Shown instead of the status, because it is what a swipe changes. */
  unread?: boolean;
}) {
  const { t } = useSite();
  const styles = unread
    ? "text-m-sage border-m-sage-soft"
    : {
        new: "text-m-sage border-m-sage-soft",
        replied: "text-m-stone border-m-line-strong",
        closed: "text-m-stone-soft border-[#EFEAE0]",
      }[status];
  const label = unread
    ? t("Non lue", "Unread")
    : {
        new: t("Nouveau", "New"),
        replied: t("Répondu", "Replied"),
        closed: t("Clos", "Closed"),
      }[status];

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-[5px] text-[10px] uppercase tracking-[.14em] ${styles}`}
    >
      {label}
    </span>
  );
}
