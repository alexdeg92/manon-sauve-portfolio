"use client";

import { useEffect, useState } from "react";
import { Exhibition } from "@/lib/exhibitions";

interface Form {
  id: string | null;
  year: string;
  title: string;
  venueFr: string;
  venueEn: string;
  kindFr: string;
  kindEn: string;
}

const empty = (): Form => ({
  id: null,
  year: String(new Date().getFullYear()),
  title: "",
  venueFr: "",
  venueEn: "",
  kindFr: "Exposition solo",
  kindEn: "",
});

const formFrom = (show: Exhibition): Form => ({
  id: show.id,
  year: show.year,
  title: show.title,
  venueFr: show.venueFr,
  venueEn: show.venueEn ?? "",
  kindFr: show.kindFr,
  kindEn: show.kindEn ?? "",
});

/**
 * The public Expositions section reads this table, so anything saved here shows
 * up on the site immediately. Empty means the section is hidden entirely rather
 * than showing placeholder shows.
 */
export default function Expositions({ onToast }: { onToast: (message: string) => void }) {
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
      onToast("Impossible de charger les expositions.");
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
      return onToast("Année, titre, lieu et type sont obligatoires.");
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
        onToast(form.id ? "Exposition modifiée." : "Exposition ajoutée.");
        setForm(null);
        await load();
      } else {
        const data = await res.json();
        onToast(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      onToast("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (show: Exhibition) => {
    if (!window.confirm(`Supprimer « ${show.title} » ? Cette action est définitive.`)) return;
    try {
      const res = await fetch(`/api/exhibitions/${show.id}`, { method: "DELETE" });
      if (res.ok) {
        onToast("Exposition supprimée.");
        if (form?.id === show.id) setForm(null);
        await load();
      } else {
        onToast("Erreur lors de la suppression.");
      }
    } catch {
      onToast("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[640px] rounded-[12px] border border-m-line bg-white px-4 py-3 text-[12px] leading-[1.6] text-m-stone">
          Ces entrées alimentent la section « Expositions et presse » du site public.
          Si la liste est vide, la section n&apos;apparaît pas.
        </div>
        <button
          onClick={() => setForm(empty())}
          className="shrink-0 rounded-full bg-m-ink px-5 py-3 text-[13px] text-m-paper transition-transform duration-300 hover:-translate-y-0.5"
        >
          Ajouter une exposition
        </button>
      </div>

      {form && (
        <div className="mt-[22px] animate-mRise rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
          <h3 className="m-0 text-[17px] font-normal">
            {form.id ? "Modifier l'exposition" : "Nouvelle exposition"}
          </h3>

          <div className="mt-5 grid grid-cols-[110px_1fr] gap-4">
            <Field label="Année" value={form.year} onChange={(year) => setForm({ ...form, year })} />
            <Field
              label="Titre"
              value={form.title}
              onChange={(title) => setForm({ ...form, title })}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field
              label="Lieu (français)"
              value={form.venueFr}
              onChange={(venueFr) => setForm({ ...form, venueFr })}
            />
            <Field
              label="Lieu (anglais, optionnel)"
              value={form.venueEn}
              onChange={(venueEn) => setForm({ ...form, venueEn })}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field
              label="Type (français)"
              value={form.kindFr}
              onChange={(kindFr) => setForm({ ...form, kindFr })}
            />
            <Field
              label="Type (anglais, optionnel)"
              value={form.kindEn}
              onChange={(kindEn) => setForm({ ...form, kindEn })}
            />
          </div>

          <div className="mt-6 flex gap-2.5">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-m-ink px-6 py-3 text-[13px] text-m-paper disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              onClick={() => setForm(null)}
              className="rounded-full border border-m-line-strong px-6 py-3 text-[13px]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="mt-[22px] overflow-hidden rounded-[14px] border border-[#E9E4DA] bg-white">
        {loading ? (
          <div className="p-[60px] text-center font-editorial text-[18px] italic text-m-stone">
            Chargement…
          </div>
        ) : shows.length === 0 ? (
          <div className="p-[60px] text-center">
            <div className="font-editorial text-[20px] italic text-m-stone">
              Aucune exposition inscrite.
            </div>
            <p className="mx-auto mt-3 max-w-[420px] text-[13px] leading-[1.6] text-m-stone-soft">
              La section « Expositions et presse » reste masquée sur le site tant
              qu&apos;aucune entrée n&apos;est ajoutée.
            </p>
          </div>
        ) : (
          shows.map((show) => (
            <div
              key={show.id}
              className="grid grid-cols-[70px_minmax(0,1fr)_160px_auto] items-center gap-4 border-b border-[#F3EFE7] px-5 py-4 last:border-b-0"
            >
              <span className="text-[14px] text-m-stone">{show.year}</span>
              <div className="min-w-0">
                <div className="truncate font-editorial text-[17px] italic">{show.title}</div>
                <div className="mt-0.5 truncate text-[13px] text-m-stone">{show.venueFr}</div>
              </div>
              <span className="truncate text-[11px] uppercase tracking-[.14em] text-m-stone-soft">
                {show.kindFr}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm(formFrom(show))}
                  className="rounded-full border border-m-line-strong px-4 py-2 text-[12px] transition-colors duration-300 hover:border-m-ink"
                >
                  Modifier
                </button>
                <button
                  onClick={() => remove(show)}
                  className="rounded-full border border-m-line-strong px-4 py-2 text-[12px] text-m-stone transition-colors duration-300 hover:border-m-ink hover:text-m-ink"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[.14em] text-m-stone">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-[10px] border border-m-line-strong bg-transparent px-3.5 py-2.5 text-[14px] outline-none focus:border-m-sage"
      />
    </label>
  );
}
