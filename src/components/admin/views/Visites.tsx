"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Availability,
  DEFAULT_AVAILABILITY,
  WEEKDAY_LABELS,
  formatSlotTime,
  isValidTime,
  upcomingVisitDays,
} from "@/lib/availability";

/**
 * Controls the two lists the studio-visit form offers. The preview below is
 * computed with the same function the public form uses, so what Manon sees here
 * is exactly what a visitor will be offered.
 */
export default function Visites({ onToast }: { onToast: (message: string) => void }) {
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch(() => onToast("Impossible de charger les disponibilités."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = useMemo(() => upcomingVisitDays(availability, "fr"), [availability]);

  const toggleDay = (day: number) =>
    setAvailability((a) => ({
      ...a,
      weekdays: a.weekdays.includes(day)
        ? a.weekdays.filter((d) => d !== day)
        : [...a.weekdays, day].sort((x, y) => x - y),
    }));

  const addTime = () => {
    const value = newTime.trim();
    if (!isValidTime(value)) return onToast("Heure invalide — utilisez le format 14:30.");
    if (availability.times.includes(value)) return onToast("Cette heure est déjà offerte.");
    setAvailability((a) => ({ ...a, times: [...a.times, value].sort() }));
    setNewTime("");
  };

  const removeTime = (time: string) =>
    setAvailability((a) => ({ ...a, times: a.times.filter((t) => t !== time) }));

  const save = async () => {
    if (availability.weekdays.length === 0) return onToast("Choisissez au moins une journée.");
    if (availability.times.length === 0) return onToast("Ajoutez au moins une heure.");

    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(availability),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailability(data);
        onToast("Disponibilités enregistrées.");
      } else {
        onToast(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      onToast("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-[38px] py-20 text-center font-editorial text-[18px] italic text-m-stone">
        Chargement des disponibilités…
      </div>
    );
  }

  return (
    <div className="animate-mFade grid grid-cols-[1.3fr_1fr] items-start gap-4 px-[38px] py-[26px]">
      <div className="rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
        <h2 className="m-0 mb-1 text-[17px] font-normal">Jours et heures offerts</h2>
        <div className="text-[13px] text-m-stone">
          Le formulaire de visite du site n&apos;offre que ces créneaux.
        </div>

        <div className="mt-6 text-[11px] uppercase tracking-[.16em] text-m-stone">
          Journées d&apos;accueil
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAY_LABELS.fr.map((label, day) => {
            const active = availability.weekdays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                aria-pressed={active}
                className={`rounded-full border px-[17px] py-[9px] text-[13px] capitalize transition-all duration-300 ${
                  active
                    ? "border-m-ink bg-m-ink text-m-paper"
                    : "border-m-line-strong bg-transparent text-m-stone-deep hover:border-m-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-7 text-[11px] uppercase tracking-[.16em] text-m-stone">
          Heures de visite
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {availability.times.length === 0 ? (
            <span className="font-editorial text-[15px] italic text-m-stone">
              Aucune heure — ajoutez-en une ci-dessous.
            </span>
          ) : (
            availability.times.map((time) => (
              <span
                key={time}
                className="flex items-center gap-2 rounded-full border border-m-line-strong px-[15px] py-[9px] text-[13px]"
              >
                {formatSlotTime(time, "fr")}
                <button
                  onClick={() => removeTime(time)}
                  title={`Retirer ${formatSlotTime(time, "fr")}`}
                  aria-label={`Retirer ${formatSlotTime(time, "fr")}`}
                  className="text-[15px] leading-none text-m-stone-soft transition-colors duration-200 hover:text-m-ink"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="mt-3.5 flex gap-2">
          <input
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTime()}
            type="time"
            className="rounded-[10px] border border-m-line-strong bg-transparent px-3.5 py-2.5 text-[14px] outline-none focus:border-m-sage"
          />
          <button
            onClick={addTime}
            className="rounded-full border border-m-line-strong px-5 py-2.5 text-[13px] transition-colors duration-300 hover:border-m-ink"
          >
            Ajouter une heure
          </button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[.16em] text-m-stone">
              Dates proposées à la fois
            </span>
            <input
              type="number"
              min={1}
              max={14}
              value={availability.maxDates}
              onChange={(e) =>
                setAvailability((a) => ({ ...a, maxDates: Number(e.target.value) || 1 }))
              }
              className="mt-2 w-full rounded-[10px] border border-m-line-strong bg-transparent px-3.5 py-2.5 text-[14px] outline-none focus:border-m-sage"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[.16em] text-m-stone">
              Fenêtre de réservation (jours)
            </span>
            <input
              type="number"
              min={1}
              max={120}
              value={availability.daysAhead}
              onChange={(e) =>
                setAvailability((a) => ({ ...a, daysAhead: Number(e.target.value) || 1 }))
              }
              className="mt-2 w-full rounded-[10px] border border-m-line-strong bg-transparent px-3.5 py-2.5 text-[14px] outline-none focus:border-m-sage"
            />
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-[22px] rounded-full bg-m-ink px-[26px] py-3.5 text-[13px] text-m-paper disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les disponibilités"}
        </button>
      </div>

      <div className="sticky top-[104px] rounded-[14px] border border-[#E9E4DA] bg-m-paper p-[26px]">
        <div className="text-[11px] uppercase tracking-[.16em] text-m-stone">
          Aperçu du formulaire
        </div>
        <div className="mt-4 text-[12px] uppercase tracking-[.16em] text-m-quiet">
          1 · Choisir un jour
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {preview.length === 0 ? (
            <span className="font-editorial text-[15px] italic text-m-stone">
              Aucune date dans la fenêtre choisie.
            </span>
          ) : (
            preview.map((day) => (
              <span
                key={day.key}
                className="rounded border border-m-line-strong px-3.5 py-2.5 text-[13px]"
              >
                {day.label}
              </span>
            ))
          )}
        </div>

        <div className="mt-5 text-[12px] uppercase tracking-[.16em] text-m-quiet">
          2 · Choisir une heure
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {availability.times.map((time) => (
            <span
              key={time}
              className="rounded border border-m-line-strong px-3.5 py-2.5 text-[13px]"
            >
              {formatSlotTime(time, "fr")}
            </span>
          ))}
        </div>

        <p className="mt-6 border-t border-m-line pt-4 text-[12px] leading-[1.6] text-m-stone">
          Une demande de visite arrive dans « Demandes » avec la date et l&apos;heure
          choisies. Rien n&apos;est réservé automatiquement : c&apos;est vous qui
          confirmez en répondant.
        </p>
      </div>
    </div>
  );
}
