"use client";

import { useMemo, useState } from "react";
import { Painting } from "@/data/paintings";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";

type Status = { tone: "ok" | "error"; text: string } | null;

/** The next four days the studio takes visitors, from today. */
function upcomingDays(lang: "fr" | "en") {
  const locale = lang === "en" ? "en-CA" : "fr-CA";
  return [1, 2, 3, 4].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" }),
    };
  });
}

const TIMES = [
  { key: "10:00", fr: "10 h 00", en: "10:00 am" },
  { key: "13:30", fr: "13 h 30", en: "1:30 pm" },
  { key: "15:00", fr: "15 h 00", en: "3:00 pm" },
  { key: "17:30", fr: "17 h 30", en: "5:30 pm" },
];

export default function Studio({ paintings }: { paintings: Painting[] }) {
  const { lang, t } = useSite();
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const days = useMemo(() => upcomingDays(lang), [lang]);
  const cover = paintings.find((p) => p.id === "abstrait-feu") ?? paintings[0];

  const dayLabel = days.find((d) => d.key === day)?.label ?? "";
  const timeLabel = TIMES.find((s) => s.key === time)?.[lang] ?? "";

  const submit = async () => {
    if (!day || !time) {
      return setStatus({
        tone: "error",
        text: t("Choisissez un jour et une heure.", "Pick a day and a time."),
      });
    }
    if (!name.trim()) {
      return setStatus({ tone: "error", text: t("Votre nom, s'il vous plaît.", "Your name, please.") });
    }
    if (!email.trim()) {
      return setStatus({
        tone: "error",
        text: t("Votre courriel, s'il vous plaît.", "Your email, please."),
      });
    }

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: "Non fourni",
          message: `Demande de visite d'atelier — ${dayLabel} à ${timeLabel}.`,
          painting: "Visite d'atelier",
        }),
      });
      const data = await res.json();
      if (data.success === true) {
        setStatus({
          tone: "ok",
          text: t(
            `Demande envoyée : ${dayLabel} à ${timeLabel}. Manon confirme par courriel sous 24 h.`,
            `Requested: ${dayLabel} at ${timeLabel}. Manon confirms by email within 24 h.`
          ),
        });
        setName("");
        setEmail("");
        setDay(null);
        setTime(null);
      } else {
        setStatus({
          tone: "error",
          text: t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again."),
        });
      }
    } catch {
      setStatus({
        tone: "error",
        text: t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again."),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="atelier" className="px-14 pt-[140px]">
      <Reveal>
        <div className="grid grid-cols-2 items-center gap-20">
          {cover && (
            <figure className="relative m-0 aspect-square overflow-hidden bg-m-sand">
              <PaintingImage src={cover.image} alt={t("Atelier", "Studio")} sizes="45vw" />
            </figure>
          )}

          <div>
            <span className="text-[12px] uppercase tracking-[.2em] text-m-sage">
              {t("Visite d'atelier", "Studio visit")}
            </span>
            <h2 className="m-0 mt-5 text-[52px] font-normal leading-[1.05] tracking-[-.03em]">
              {t("Voir les toiles en personne", "Come see the canvases in person")}
            </h2>
            <p className="mt-6 max-w-[440px] font-editorial text-[18px] leading-[1.65] text-m-stone-deep">
              {t(
                "Une heure à l'atelier de Saint-Joseph-du-Lac : les toiles en cours, les pièces disponibles, et le temps de discuter d'une commande. Sans frais, sans engagement.",
                "One hour at the Saint-Joseph-du-Lac studio: works in progress, the pieces available, and time to talk about a commission. Free, no obligation."
              )}
            </p>

            <div className="mt-[38px] rounded border border-m-line bg-white p-7">
              <div className="text-[12px] uppercase tracking-[.16em] text-m-quiet">
                {t("1 · Choisir un jour", "1 · Pick a day")}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {days.map((d) => (
                  <Slot key={d.key} active={day === d.key} onClick={() => setDay(d.key)}>
                    {d.label}
                  </Slot>
                ))}
              </div>

              <div className="mt-6 text-[12px] uppercase tracking-[.16em] text-m-quiet">
                {t("2 · Choisir une heure", "2 · Pick a time")}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {TIMES.map((s) => (
                  <Slot key={s.key} active={time === s.key} onClick={() => setTime(s.key)}>
                    {s[lang]}
                  </Slot>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Nom", "Name")}
                  autoComplete="name"
                  className="rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Courriel", "Email")}
                  type="email"
                  autoComplete="email"
                  className="rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
                />
              </div>

              <button
                onClick={submit}
                disabled={sending}
                className="mt-4 w-full rounded-full bg-m-ink py-4 text-[14px] text-m-paper transition-colors duration-500 hover:bg-m-sage disabled:opacity-60"
              >
                {sending ? t("Envoi…", "Sending…") : t("Confirmer la visite", "Confirm the visit")}
              </button>
              {status && (
                <div
                  className={`mt-3.5 text-[13px] ${
                    status.tone === "ok" ? "text-m-sage" : "text-red-600"
                  }`}
                >
                  {status.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Slot({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded border px-4 py-3 text-left text-[13px] transition-all duration-300 ${
        active ? "border-m-ink bg-m-ink text-m-paper" : "border-[#D8D3C8] bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}
