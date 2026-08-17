"use client";

import { useEffect, useState } from "react";
import { Exhibition, localized } from "@/lib/exhibitions";
import { useSite } from "@/components/site/context";
import SubScreen from "./SubScreen";

interface Form {
  id: string | null;
  year: string;
  title: string;
  venueFr: string;
  kindFr: string;
}

const empty = (): Form => ({
  id: null,
  year: String(new Date().getFullYear()),
  title: "",
  venueFr: "",
  kindFr: "",
});

/**
 * Mobile editor for the public "Expositions et presse" section. English labels
 * are desktop-only: this keeps the phone form to the four fields that matter.
 */
export default function Expositions({ onBack }: { onBack: () => void }) {
  const { lang, t, say } = useSite();
  const [shows, setShows] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/exhibitions");
      const data = await res.json();
      if (Array.isArray(data)) setShows(data);
    } catch {
      say(t("Chargement impossible.", "Could not load."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!form) return;
    if (!form.year.trim() || !form.title.trim() || !form.venueFr.trim() || !form.kindFr.trim()) {
      return say(t("Tous les champs sont requis.", "All fields are required."));
    }

    setSaving(true);
    try {
      const res = await fetch(
        form.id ? `/api/exhibitions/${form.id}` : "/api/exhibitions",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        say(form.id ? t("Exposition modifiée.", "Show updated.") : t("Exposition ajoutée.", "Show added."));
        setForm(null);
        await load();
      } else {
        const data = await res.json();
        say(data.error || t("Erreur d'enregistrement.", "Could not save."));
      }
    } catch {
      say(t("Erreur d'enregistrement.", "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (show: Exhibition) => {
    try {
      const res = await fetch(`/api/exhibitions/${show.id}`, { method: "DELETE" });
      if (res.ok) {
        say(t("Exposition supprimée.", "Show deleted."));
        if (form?.id === show.id) setForm(null);
        await load();
      } else {
        say(t("Erreur de suppression.", "Could not delete."));
      }
    } catch {
      say(t("Erreur de suppression.", "Could not delete."));
    }
  };

  return (
    <SubScreen title={t("Expositions", "Exhibitions")} onBack={onBack}>
      <div className="px-6 pt-4">
        <p className="m-0 rounded-[12px] border border-m-line bg-white px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
          {t(
            "Ces entrées apparaissent sur le site. Sans entrée, la section reste masquée.",
            "These appear on the public site. With none, the section stays hidden."
          )}
        </p>
      </div>

      {form ? (
        <div className="px-6 pt-5">
          <div className="rounded-[16px] border border-m-line bg-white p-[18px]">
            <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
              {form.id ? t("Modifier", "Edit") : t("Nouvelle exposition", "New show")}
            </div>
            <input
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder={t("Année", "Year")}
              inputMode="numeric"
              className="mt-3 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3 text-[14px] outline-none focus:border-m-sage"
            />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("Titre", "Title")}
              className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3 text-[14px] outline-none focus:border-m-sage"
            />
            <input
              value={form.venueFr}
              onChange={(e) => setForm({ ...form, venueFr: e.target.value })}
              placeholder={t("Lieu", "Venue")}
              className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3 text-[14px] outline-none focus:border-m-sage"
            />
            <input
              value={form.kindFr}
              onChange={(e) => setForm({ ...form, kindFr: e.target.value })}
              placeholder={t("Type (ex. Exposition solo)", "Kind (e.g. Solo show)")}
              className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3 text-[14px] outline-none focus:border-m-sage"
            />
            <div className="mt-3.5 flex gap-2.5">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 rounded-full bg-m-ink py-3.5 text-[14px] text-m-paper disabled:opacity-60"
              >
                {saving ? t("Enregistrement…", "Saving…") : t("Enregistrer", "Save")}
              </button>
              <button
                onClick={() => setForm(null)}
                className="rounded-full border border-m-line-strong px-5 py-3.5 text-[14px]"
              >
                {t("Annuler", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-5">
          <button
            onClick={() => setForm(empty())}
            className="w-full rounded-full bg-m-ink py-3.5 text-[14px] text-m-paper"
          >
            {t("Ajouter une exposition", "Add a show")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="px-6 py-[50px] text-center font-editorial italic text-m-stone">
          {t("Chargement…", "Loading…")}
        </div>
      ) : shows.length === 0 ? (
        <div className="px-6 py-[40px] text-center font-editorial italic text-m-stone">
          {t("Aucune exposition inscrite.", "No shows yet.")}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-6 pt-4">
          {shows.map((show) => (
            <div
              key={show.id}
              className="animate-mRise rounded-[16px] border border-m-line bg-white p-[18px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-m-stone">{show.year}</div>
                  <div className="mt-0.5 truncate font-editorial text-[19px] italic">
                    {show.title}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-m-stone">
                    {localized(show.venueFr, show.venueEn, lang)} ·{" "}
                    {localized(show.kindFr, show.kindEn, lang)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    setForm({
                      id: show.id,
                      year: show.year,
                      title: show.title,
                      venueFr: show.venueFr,
                      kindFr: show.kindFr,
                    })
                  }
                  className="flex-1 rounded-full border border-m-line-strong py-2.5 text-[12px]"
                >
                  {t("Modifier", "Edit")}
                </button>
                <button
                  onClick={() => remove(show)}
                  className="flex-1 rounded-full border border-m-line-strong py-2.5 text-[12px] text-m-stone"
                >
                  {t("Supprimer", "Delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  );
}
