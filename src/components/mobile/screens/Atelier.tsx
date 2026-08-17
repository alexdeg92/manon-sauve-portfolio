"use client";

import { useEffect, useMemo, useState } from "react";
import { Painting } from "@/data/paintings";
import { useSite } from "@/components/site/context";
import {
  Availability,
  DEFAULT_AVAILABILITY,
  formatSlotTime,
  upcomingVisitDays,
} from "@/lib/availability";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";

interface AtelierProps {
  paintings: Painting[];
  onOpenCommission: () => void;
}

type Status = { tone: "ok" | "error"; text: string } | null;


export default function Atelier({ paintings, onOpenCommission }: AtelierProps) {
  const { lang, t } = useSite();
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  // Same source as the desktop form, so both offer identical slots.
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);

  useEffect(() => {
    let active = true;
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (active) setAvailability(data);
      })
      .catch(() => {
        // Keep the defaults rather than showing an empty form.
      });
    return () => {
      active = false;
    };
  }, []);

  const days = useMemo(() => upcomingVisitDays(availability, lang), [availability, lang]);
  const cover = paintings.find((p) => p.id === "abstrait-feu") ?? paintings[0];

  const dayLabel = days.find((d) => d.key === day)?.label ?? "";
  const timeLabel = time ? formatSlotTime(time, lang) : "";

  const submit = async () => {
    if (!day || !time) {
      return setStatus({
        tone: "error",
        text: t("Choisissez un jour et une heure.", "Pick a day and a time."),
      });
    }
    if (!name.trim()) {
      return setStatus({
        tone: "error",
        text: t("Votre nom, s'il vous plaît.", "Your name, please."),
      });
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
          phone: phone.trim(),
          message: `Demande de visite d'atelier — ${dayLabel} à ${timeLabel}.`,
          painting: "Visite d'atelier",
        }),
      });
      const data = await res.json();
      if (data.success === true) {
        setStatus({
          tone: "ok",
          text: t(
            `Demande envoyée : ${dayLabel} à ${timeLabel}. Manon confirme sous 24 h.`,
            `Requested: ${dayLabel} at ${timeLabel}. Manon confirms within 24 h.`
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
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Atelier", "Studio")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {t(
            "Réservez une heure avec Manon, ou demandez une commande.",
            "Book an hour with Manon, or ask for a commission."
          )}
        </p>
      </div>

      {cover && (
        <Reveal className="mx-6 mt-[22px]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-m-sand">
            <PaintingImage src={cover.image} alt={t("Atelier", "Studio")} sizes="100vw" />
          </div>
        </Reveal>
      )}

      <Reveal index={1} className="mx-6 mt-[22px]">
        <div className="rounded-[18px] border border-m-line bg-white p-[22px]">
          <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
            {t("1 · Choisir un jour", "1 · Pick a day")}
          </div>
          <div className="m-rail mt-3 flex gap-2 overflow-x-auto">
            {days.map((d) => (
              <Slot key={d.key} active={day === d.key} onClick={() => setDay(d.key)}>
                {d.label}
              </Slot>
            ))}
          </div>

          <div className="mt-5 text-[10px] uppercase tracking-[.16em] text-m-stone">
            {t("2 · Choisir une heure", "2 · Pick a time")}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {availability.times.map((slot) => (
              <Slot key={slot} active={time === slot} onClick={() => setTime(slot)}>
                {formatSlotTime(slot, lang)}
              </Slot>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Nom", "Name")}
            autoComplete="name"
            className="mt-4 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("Courriel", "Email")}
            type="email"
            autoComplete="email"
            className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("Téléphone (optionnel)", "Phone (optional)")}
            type="tel"
            autoComplete="tel"
            className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
          <button
            onClick={submit}
            disabled={sending}
            className="mt-3.5 w-full rounded-full bg-m-ink py-4 text-[14px] text-m-paper disabled:opacity-60"
          >
            {sending
              ? t("Envoi…", "Sending…")
              : t("Confirmer la visite", "Confirm the visit")}
          </button>
          {status && (
            <div
              className={`mt-3 text-[13px] leading-[1.5] ${
                status.tone === "ok" ? "text-m-sage" : "text-red-600"
              }`}
            >
              {status.text}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal index={2} className="mx-6 mt-[18px]">
        <div className="rounded-[18px] bg-m-sand-soft p-[22px]">
          <div className="text-[10px] uppercase tracking-[.16em] text-m-sage">
            {t("Commande", "Commission")}
          </div>
          <div className="mt-2 font-editorial text-[22px] italic leading-[1.25]">
            {t("Une toile pensée pour votre mur", "A painting made for your wall")}
          </div>
          <p className="mt-2.5 text-[14px] text-m-stone-deep">
            {t(
              "Écrivez-moi votre idée, je réponds habituellement dans les 24 heures.",
              "Send me your idea, I usually reply within 24 hours."
            )}
          </p>
          <button
            onClick={onOpenCommission}
            className="mt-4 rounded-full border border-m-ink bg-transparent px-[22px] py-3.5 text-[14px]"
          >
            {t("Commencer une demande", "Start a request")}
          </button>
        </div>
      </Reveal>
    </div>
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
      className={`shrink-0 rounded-[12px] border px-3.5 py-3 text-[13px] transition-all duration-300 ${
        active ? "border-m-ink bg-m-ink text-m-paper" : "border-m-line-strong bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}
