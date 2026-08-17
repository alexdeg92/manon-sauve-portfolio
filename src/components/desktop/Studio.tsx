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

type Status = { tone: "ok" | "error"; text: string } | null;


export default function Studio({ paintings }: { paintings: Painting[] }) {
  const { lang, t } = useSite();
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  // Which days and times are offered is set in the admin, so read it rather
  // than assuming a fixed weekly shape.
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
                {availability.times.map((slot) => (
                  <Slot key={slot} active={time === slot} onClick={() => setTime(slot)}>
                    {formatSlotTime(slot, lang)}
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
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("Téléphone (optionnel)", "Phone (optional)")}
                  type="tel"
                  autoComplete="tel"
                  className="col-span-2 rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
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
