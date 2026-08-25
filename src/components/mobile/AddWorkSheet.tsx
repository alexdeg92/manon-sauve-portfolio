"use client";

import { useEffect, useRef, useState } from "react";
import { Painting } from "@/data/paintings";
import { useSite } from "@/components/site/context";
import Sheet from "./Sheet";

interface AddWorkSheetProps {
  open: boolean;
  /** Collection names already in use, offered as one-tap choices. */
  collections: string[];
  onClose: () => void;
  /** Resolves true once the work is saved, so the sheet can clear itself. */
  onCreate: (payload: Omit<Painting, "id">) => Promise<boolean>;
}

const emptyForm = () => ({
  title: "",
  medium: "Acrylique sur toile",
  dimensions: "",
  price: "",
  year: String(new Date().getFullYear()),
  collection: "",
  note: "",
  sold: false,
});

/**
 * The phone counterpart of the desktop EditDrawer: pick a photo from the camera
 * roll (or the camera), upload it to the same /api/upload endpoint, then save
 * the work. The upload runs as soon as a file is chosen so the artist sees the
 * photo land before filling the rest in.
 */
export default function AddWorkSheet({ open, collections, onClose, onCreate }: AddWorkSheetProps) {
  const { t, say } = useSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyForm);
  /** Local object URL, shown while the file is still on its way to storage. */
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ReturnType<typeof emptyForm>>(
    key: K,
    value: ReturnType<typeof emptyForm>[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // A reopened sheet always starts blank rather than on the previous draft.
  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setImage("");
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setUploading(false);
    setSaving(false);
  }, [open]);

  // The object URL holds the file in memory until it is released.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pickFile = async (file: File) => {
    const local = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return local;
    });
    setImage("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "upload");
      setImage(data.url as string);
      say(t("Photo téléversée.", "Photo uploaded."));
    } catch {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
      say(t("Erreur lors du téléversement.", "Could not upload the photo."));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.title.trim()) return say(t("Le titre est obligatoire.", "A title is required."));
    if (!image) return say(t("Ajoutez une photo.", "Add a photo first."));

    setSaving(true);
    try {
      const ok = await onCreate({
        title: form.title.trim(),
        medium: form.medium.trim(),
        dimensions: form.dimensions.trim(),
        price: form.price.trim() === "" ? null : Number(form.price.replace(/[^\d.]/g, "")),
        year: Number(form.year) || new Date().getFullYear(),
        image,
        sold: form.sold,
        collection: form.collection.trim() || null,
        note: form.note.trim() || null,
      });
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  const shown = image || preview;

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-6 pb-[30px] pt-3">
        <div className="text-[10px] uppercase tracking-[.2em] text-m-sage">
          {t("Atelier", "Studio")}
        </div>
        <h3 className="mt-2 font-editorial text-[26px] font-light italic">
          {t("Ajouter une œuvre", "Add a work")}
        </h3>
        <p className="mt-1.5 text-[13px] text-m-stone">
          {t(
            "Prenez la photo ou choisissez-la dans vos images.",
            "Take the photo or pick one from your library."
          )}
        </p>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || saving}
          className={`mt-[18px] block w-full overflow-hidden rounded-[18px] disabled:opacity-60 ${
            shown ? "bg-m-sand" : "border border-dashed border-[#C9C3B7] bg-[#FCFBF8]"
          }`}
        >
          {shown ? (
            <div className="relative aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shown} alt="" className="h-full w-full object-cover" />
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-m-ink/45 font-editorial text-[17px] italic text-m-paper">
                  {t("Envoi en cours…", "Uploading…")}
                </span>
              )}
            </div>
          ) : (
            <span className="flex flex-col items-center gap-2 px-6 py-[42px] text-m-stone">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4A6B4F"
                strokeWidth="1.3"
              >
                <rect x="3" y="6" width="18" height="14" rx="2.5" />
                <circle cx="12" cy="13" r="3.4" />
                <path d="M8.5 6 10 3.5h4L15.5 6" />
              </svg>
              <span className="font-editorial text-[18px] italic text-m-stone-deep">
                {t("Choisir une photo", "Choose a photo")}
              </span>
              <span className="text-[12px]">{t("JPEG ou PNG", "JPEG or PNG")}</span>
            </span>
          )}
        </button>

        {shown && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || saving}
            className="mt-2.5 w-full rounded-full border border-m-line-strong py-3 text-[13px] disabled:opacity-50"
          >
            {uploading ? t("Envoi en cours…", "Uploading…") : t("Remplacer la photo", "Replace the photo")}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pickFile(file);
            e.target.value = "";
          }}
        />

        <Label>{t("Titre", "Title")}</Label>
        <Field value={form.title} onChange={(v) => set("title", v)} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label className="mt-0">{t("Prix ($)", "Price ($)")}</Label>
            <Field
              value={form.price}
              onChange={(v) => set("price", v)}
              inputMode="numeric"
              placeholder={t("Vide = sur demande", "Empty = on request")}
            />
          </div>
          <div>
            <Label className="mt-0">{t("Année", "Year")}</Label>
            <Field value={form.year} onChange={(v) => set("year", v)} inputMode="numeric" />
          </div>
        </div>

        <Label>{t("Format", "Size")}</Label>
        <Field
          value={form.dimensions}
          onChange={(v) => set("dimensions", v)}
          placeholder={'16" × 20"'}
        />

        <Label>{t("Médium", "Medium")}</Label>
        <Field value={form.medium} onChange={(v) => set("medium", v)} />

        <Label>{t("Collection", "Collection")}</Label>
        {collections.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {collections.map((name) => (
              <button
                key={name}
                onClick={() => set("collection", form.collection === name ? "" : name)}
                aria-pressed={form.collection === name}
                className={`rounded-full border px-4 py-[9px] text-[13px] transition-all duration-300 ${
                  form.collection === name
                    ? "border-m-ink bg-m-ink text-m-paper"
                    : "border-m-line-strong bg-transparent"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <Field
          value={form.collection}
          onChange={(v) => set("collection", v)}
          placeholder={t("Nom de la série", "Series name")}
        />

        <Label>{t("Note d'atelier", "Studio note")}</Label>
        <textarea
          rows={3}
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder={t(
            "Quelques mots sur la pièce, affichés sur le site.",
            "A few words about the piece, shown on the site."
          )}
          className="mt-2.5 w-full resize-y rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[15px] outline-none focus:border-m-sage"
        />

        <Label>{t("Statut", "Status")}</Label>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => set("sold", false)}
            aria-pressed={!form.sold}
            className={`flex-1 rounded-full border py-3 text-[13px] transition-all duration-300 ${
              !form.sold
                ? "border-m-sage bg-m-sage text-m-paper"
                : "border-m-line-strong bg-transparent"
            }`}
          >
            {t("Disponible", "Available")}
          </button>
          <button
            onClick={() => set("sold", true)}
            aria-pressed={form.sold}
            className={`flex-1 rounded-full border py-3 text-[13px] transition-all duration-300 ${
              form.sold
                ? "border-m-ink bg-m-ink text-m-paper"
                : "border-m-line-strong bg-transparent"
            }`}
          >
            {t("Vendu", "Sold")}
          </button>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            onClick={submit}
            disabled={saving || uploading}
            className="flex-1 rounded-full bg-m-ink py-4 text-[14px] text-m-paper disabled:opacity-50"
          >
            {saving
              ? t("Enregistrement…", "Saving…")
              : t("Ajouter à la galerie", "Add to the gallery")}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-m-line-strong px-5 py-4 text-[14px] disabled:opacity-50"
          >
            {t("Fermer", "Close")}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-4 text-[11px] uppercase tracking-[.16em] text-m-stone ${className}`}>
      {children}
    </div>
  );
}

function Field({
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
      className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[15px] outline-none focus:border-m-sage"
    />
  );
}
