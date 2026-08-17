"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, categoryOf } from "@/lib/mobile";
import { Draft } from "./types";

interface EditDrawerProps {
  draft: Draft | null;
  /** Collection names already in use, offered as one-tap choices. */
  collections: string[];
  saving: boolean;
  uploading: boolean;
  onChange: (draft: Draft) => void;
  onUpload: (file: File) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditDrawer({
  draft,
  collections,
  saving,
  uploading,
  onChange,
  onUpload,
  onSave,
  onDelete,
  onClose,
}: EditDrawerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [draft?.id]);

  useEffect(() => {
    if (!draft) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, onClose]);

  if (!draft) return null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  // Leaving the collection empty is allowed: the site then falls back to the
  // group derived from the title, which is what this suggestion shows.
  const derived = draft.title
    ? CATEGORY_LABELS[
        categoryOf({
          id: draft.id ?? "",
          title: draft.title,
          medium: draft.medium,
          dimensions: draft.dimensions,
          price: null,
          image: draft.image,
          year: Number(draft.year) || 0,
        })
      ].fr
    : null;

  const choices = Array.from(new Set([...collections, ...(derived ? [derived] : [])])).sort();

  return (
    <div className="fixed inset-0 z-[60]">
      <div onClick={onClose} className="absolute inset-0 animate-mFade bg-m-ink/[.42]" />
      <div className="absolute inset-y-0 right-0 w-[520px] animate-mRise overflow-y-auto bg-m-paper shadow-[-30px_0_60px_-30px_rgba(23,24,26,.4)]">
        <div className="px-[34px] py-[30px]">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[.16em] text-m-stone">
              {draft.id ? "Fiche d'œuvre" : "Nouvelle œuvre"}
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-m-line-strong px-4 py-2 text-[12px]"
            >
              Fermer
            </button>
          </div>

          <div className="mt-5 aspect-[4/5] overflow-hidden rounded-[14px] bg-m-sand">
            {draft.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[#C9C3B7] text-m-stone"
              >
                <span className="font-editorial text-[18px] italic">
                  {uploading ? "Envoi en cours…" : "Ajouter une photo"}
                </span>
                <span className="text-[12px]">JPEG ou PNG</span>
              </button>
            )}
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 w-full rounded-full border border-m-line-strong py-2.5 text-[12px] disabled:opacity-50"
          >
            {uploading ? "Envoi en cours…" : draft.image ? "Remplacer la photo" : "Choisir un fichier"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />

          <Label>Titre</Label>
          <Input value={draft.title} onChange={(v) => set("title", v)} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mt-0">Prix ($)</Label>
              <Input
                value={draft.price}
                onChange={(v) => set("price", v)}
                inputMode="numeric"
                placeholder="Vide = sur demande"
              />
            </div>
            <div>
              <Label className="mt-0">Année</Label>
              <Input value={draft.year} onChange={(v) => set("year", v)} inputMode="numeric" />
            </div>
          </div>

          <Label>Format</Label>
          <Input
            value={draft.dimensions}
            onChange={(v) => set("dimensions", v)}
            placeholder={'16" × 20"'}
          />

          <Label>Médium</Label>
          <Input value={draft.medium} onChange={(v) => set("medium", v)} />

          <Label>Collection</Label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {choices.map((name) => (
              <button
                key={name}
                onClick={() => set("collection", draft.collection === name ? "" : name)}
                aria-pressed={draft.collection === name}
                className={`rounded-full border px-4 py-[9px] text-[13px] transition-all duration-300 ${
                  draft.collection === name
                    ? "border-m-ink bg-m-ink text-m-paper"
                    : "border-m-line-strong bg-transparent"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <input
            value={draft.collection}
            onChange={(e) => set("collection", e.target.value)}
            placeholder={derived ? `Vide = ${derived}` : "Nom de la série"}
            className="mt-2.5 w-full rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3 text-[14px] outline-none focus:border-m-sage"
          />

          <Label>Note d&apos;atelier</Label>
          <textarea
            rows={4}
            value={draft.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Quelques mots sur la pièce, affichés sur le site."
            className="mt-2.5 w-full resize-y rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />

          <Label>Statut</Label>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => set("sold", false)}
              aria-pressed={!draft.sold}
              className={`flex-1 rounded-full border py-3 text-[13px] transition-all duration-300 ${
                !draft.sold
                  ? "border-m-sage bg-m-sage text-m-paper"
                  : "border-m-line-strong bg-transparent"
              }`}
            >
              Disponible
            </button>
            <button
              onClick={() => set("sold", true)}
              aria-pressed={draft.sold}
              className={`flex-1 rounded-full border py-3 text-[13px] transition-all duration-300 ${
                draft.sold
                  ? "border-m-ink bg-m-ink text-m-paper"
                  : "border-m-line-strong bg-transparent"
              }`}
            >
              Vendu
            </button>
          </div>

          <div className="mt-6 flex gap-2.5 pb-5">
            <button
              onClick={onSave}
              disabled={saving || uploading}
              className="flex-1 rounded-full bg-m-ink py-[15px] text-[14px] text-m-paper disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            {draft.id &&
              (confirmDelete ? (
                <button
                  onClick={onDelete}
                  disabled={saving}
                  className="rounded-full bg-[#7C3B32] px-[22px] py-[15px] text-[14px] text-m-paper disabled:opacity-50"
                >
                  Confirmer
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-m-line-strong px-[22px] py-[15px] text-[14px] text-[#7C3B32]"
                >
                  Supprimer
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-4 text-[11px] uppercase tracking-[.16em] text-m-stone ${className}`}>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="mt-2.5 w-full rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[15px] outline-none focus:border-m-sage"
    />
  );
}
