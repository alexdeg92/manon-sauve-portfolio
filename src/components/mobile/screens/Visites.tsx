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
import { useSite } from "@/components/site/context";
import SubScreen from "./SubScreen";

/**
 * Mobile twin of the desktop Visites panel: the same two lists the public
 * studio-visit form reads, with the same live preview.
 */
export default function Visites({ onBack }: { onBack: () => void }) {
  const { lang, t, say } = useSite();
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch(() => say(t("Chargement impossible.", "Could not load.")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = useMemo(() => upcomingVisitDays(availability, lang), [availability, lang]);

  const toggleDay = (day: number) =>
    setAvailability((a) => ({
      ...a,
      weekdays: a.weekdays.includes(day)
        ? a.weekdays.filter((d) => d !== day)
        : [...a.weekdays, day].sort((x, y) => x - y),
    }));

  const addTime = () => {
    const value = newTime.trim();
    if (!isValidTime(value)) {
      return say(t("Heure invalide (ex. 14:30).", "Invalid time (e.g. 14:30)."));
    }
    if (availability.times.includes(value)) {
      return say(t("Cette heure existe déjà.", "That time is already offered."));
    }
    setAvailability((a) => ({ ...a, times: [...a.times, value].sort() }));
    setNewTime("");
  };

  const save = async () => {
    if (availability.weekdays.length === 0) {
      return say(t("Choisissez au moins une journée.", "Pick at least one day."));
    }
    if (availability.times.length === 0) {
      return say(t("Ajoutez au moins une heure.", "Add at least one time."));
    }

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
        say(t("Disponibilités enregistrées.", "Availability saved."));
      } else {
        say(data.error || t("Erreur d'enregistrement.", "Could not save."));
      }
    } catch {
      say(t("Erreur d'enregistrement.", "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubScreen title={t("Visites d'atelier", "Studio visits")} onBack={onBack}>
      {loading ? (
        <div className="px-6 py-[50px] text-center font-editorial italic text-m-stone">
          {t("Chargement…", "Loading…")}
        </div>
      ) : (
        <>
          <div className="px-6 pt-4">
            <p className="m-0 rounded-[12px] border border-m-line bg-white px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
              {t(
                "Le formulaire de visite du site n'offre que ces journées et ces heures.",
                "The site's visit form only offers these days and times."
              )}
            </p>
          </div>

          <div className="px-6 pt-6">
            <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
              {t("Journées d'accueil", "Open days")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEKDAY_LABELS[lang].map((label, day) => {
                const active = availability.weekdays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    aria-pressed={active}
                    className={`rounded-full border px-[15px] py-[9px] text-[13px] capitalize transition-all duration-300 ${
                      active
                        ? "border-m-ink bg-m-ink text-m-paper"
                        : "border-m-line-strong bg-transparent text-m-stone-deep"
                    }`}
                  >
                    {label.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 pt-7">
            <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
              {t("Heures de visite", "Visit times")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {availability.times.length === 0 ? (
                <span className="font-editorial text-[15px] italic text-m-stone">
                  {t("Aucune heure.", "No times yet.")}
                </span>
              ) : (
                availability.times.map((time) => (
                  <span
                    key={time}
                    className="flex items-center gap-2 rounded-full border border-m-line-strong px-[14px] py-[9px] text-[13px]"
                  >
                    {formatSlotTime(time, lang)}
                    <button
                      onClick={() =>
                        setAvailability((a) => ({
                          ...a,
                          times: a.times.filter((x) => x !== time),
                        }))
                      }
                      aria-label={`${t("Retirer", "Remove")} ${formatSlotTime(time, lang)}`}
                      className="text-[16px] leading-none text-m-stone-soft"
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
                type="time"
                className="flex-1 rounded-[12px] border border-m-line-strong bg-white px-4 py-3 text-[14px] outline-none focus:border-m-sage"
              />
              <button
                onClick={addTime}
                className="rounded-full border border-m-line-strong px-5 py-3 text-[13px]"
              >
                {t("Ajouter", "Add")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-6 pt-7">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[.16em] text-m-stone">
                {t("Dates à la fois", "Dates at once")}
              </span>
              <input
                type="number"
                min={1}
                max={14}
                value={availability.maxDates}
                onChange={(e) =>
                  setAvailability((a) => ({ ...a, maxDates: Number(e.target.value) || 1 }))
                }
                className="mt-2 w-full rounded-[12px] border border-m-line-strong bg-white px-4 py-3 text-[14px] outline-none focus:border-m-sage"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[.16em] text-m-stone">
                {t("Fenêtre (jours)", "Window (days)")}
              </span>
              <input
                type="number"
                min={1}
                max={120}
                value={availability.daysAhead}
                onChange={(e) =>
                  setAvailability((a) => ({ ...a, daysAhead: Number(e.target.value) || 1 }))
                }
                className="mt-2 w-full rounded-[12px] border border-m-line-strong bg-white px-4 py-3 text-[14px] outline-none focus:border-m-sage"
              />
            </label>
          </div>

          <div className="px-6 pt-7">
            <div className="rounded-[16px] border border-m-line bg-m-sand-soft p-[18px]">
              <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
                {t("Aperçu du formulaire", "Form preview")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {preview.length === 0 ? (
                  <span className="font-editorial text-[15px] italic text-m-stone">
                    {t("Aucune date dans la fenêtre.", "No dates in the window.")}
                  </span>
                ) : (
                  preview.map((day) => (
                    <span
                      key={day.key}
                      className="rounded-[10px] border border-m-line-strong bg-white px-3 py-2 text-[12px]"
                    >
                      {day.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-2 pt-6">
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-full bg-m-ink py-4 text-[14px] text-m-paper disabled:opacity-60"
            >
              {saving ? t("Enregistrement…", "Saving…") : t("Enregistrer", "Save")}
            </button>
            <p className="mt-3 text-center text-[11px] leading-[1.5] text-m-stone-soft">
              {t(
                "Rien n'est réservé automatiquement : la demande arrive dans « Demandes ».",
                "Nothing is booked automatically: the request lands in Inquiries."
              )}
            </p>
          </div>
        </>
      )}
    </SubScreen>
  );
}
