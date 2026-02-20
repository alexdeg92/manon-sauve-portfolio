"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Painting {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  price: number;
  image: string;
  year: number;
}

type FormData = {
  title: string;
  medium: string;
  dimensions: string;
  price: string;
  year: string;
  image: string;
};

const emptyForm: FormData = {
  title: "",
  medium: "",
  dimensions: "",
  price: "",
  year: new Date().getFullYear().toString(),
  image: "",
};

export default function AdminDashboard() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<Painting | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load paintings
  const loadPaintings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paintings");
      const data = await res.json();
      setPaintings(Array.isArray(data) ? data : []);
    } catch {
      showToast("Impossible de charger les tableaux.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaintings();
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `${data.count} tableaux importés !`, true);
        loadPaintings();
      } else {
        showToast(data.error || "Erreur lors de l'import", false);
      }
    } catch {
      showToast("Erreur lors de l'import", false);
    } finally {
      setSeeding(false);
    }
  };

  // Image upload
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({ ...f, image: data.url }));
        showToast("Photo téléchargée ✓", true);
      } else {
        showToast(data.error || "Erreur upload", false);
      }
    } catch {
      showToast("Erreur lors de l'upload de la photo", false);
    } finally {
      setUploading(false);
    }
  };

  const startAdd = () => {
    setForm(emptyForm);
    setEditTarget(null);
    setView("add");
  };

  const startEdit = (p: Painting) => {
    setForm({
      title: p.title,
      medium: p.medium,
      dimensions: p.dimensions,
      price: String(p.price),
      year: String(p.year),
      image: p.image,
    });
    setEditTarget(p);
    setView("edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("Le titre est obligatoire.", false);
      return;
    }
    if (!form.image) {
      showToast("Veuillez télécharger une photo.", false);
      return;
    }

    setSaving(true);
    try {
      let res: Response;
      if (view === "edit" && editTarget) {
        res = await fetch(`/api/paintings/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            medium: form.medium,
            dimensions: form.dimensions,
            price: Number(form.price),
            year: Number(form.year),
            image: form.image,
          }),
        });
      } else {
        res = await fetch("/api/paintings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `painting-${Date.now()}`,
            title: form.title,
            medium: form.medium,
            dimensions: form.dimensions,
            price: Number(form.price),
            year: Number(form.year),
            image: form.image,
          }),
        });
      }

      if (res.ok) {
        showToast(
          view === "edit" ? "Tableau modifié ✓" : "Tableau ajouté ✓",
          true
        );
        setView("list");
        loadPaintings();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la sauvegarde", false);
      }
    } catch {
      showToast("Erreur lors de la sauvegarde", false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/paintings/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Tableau supprimé ✓", true);
        setDeleteConfirm(null);
        loadPaintings();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la suppression", false);
      }
    } catch {
      showToast("Erreur lors de la suppression", false);
    }
  };

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-[#5c5c5c] mb-1 uppercase tracking-wide text-xs">
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass =
    "w-full border border-[#e0d9d0] rounded-xl px-4 py-3 text-[#2c2c2c] text-base focus:outline-none focus:ring-2 focus:ring-[#9b8b7c] bg-[#fdfbf8]";

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <div className="min-h-screen bg-[#f9f6f1] pb-20">
        {/* Header */}
        <div className="bg-white border-b border-[#e0d9d0] px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setView("list")}
            className="text-[#9b8b7c] hover:text-[#2c2c2c] transition-colors"
          >
            ← Retour
          </button>
          <h1 className="font-serif text-xl text-[#2c2c2c]">
            {view === "edit" ? "Modifier le tableau" : "Ajouter un tableau"}
          </h1>
        </div>

        <div className="max-w-xl mx-auto p-6 space-y-5 mt-4">
          {/* Photo Upload — first and most prominent */}
          <Field label="Photo du tableau *">
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                form.image
                  ? "border-green-400 bg-green-50"
                  : "border-[#e0d9d0] bg-white hover:border-[#9b8b7c]"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {form.image ? (
                <div className="space-y-3">
                  <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
                    <Image
                      src={form.image}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Photo chargée
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, image: "" }));
                    }}
                    className="text-xs text-[#9b8b7c] underline"
                  >
                    Changer de photo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploading ? (
                    <p className="text-[#9b8b7c] text-base">
                      Téléchargement en cours...
                    </p>
                  ) : (
                    <>
                      <div className="text-4xl">📷</div>
                      <p className="text-[#5c5c5c] text-base font-medium">
                        Cliquez pour choisir une photo
                      </p>
                      <p className="text-[#bbb] text-sm">
                        JPG, PNG — max 10 Mo
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </Field>

          <Field label="Titre du tableau *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="ex. Éclat rose"
            />
          </Field>

          <Field label="Technique">
            <input
              type="text"
              value={form.medium}
              onChange={(e) =>
                setForm((f) => ({ ...f, medium: e.target.value }))
              }
              className={inputClass}
              placeholder='ex. Huile sur toile'
            />
          </Field>

          <Field label="Dimensions">
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) =>
                setForm((f) => ({ ...f, dimensions: e.target.value }))
              }
              className={inputClass}
              placeholder='ex. 18" × 24"'
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix ($CAD)">
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className={inputClass}
                placeholder="ex. 950"
                min="0"
              />
            </Field>

            <Field label="Année">
              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className={inputClass}
                placeholder="ex. 2024"
                min="2000"
                max="2100"
              />
            </Field>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full bg-[#2c2c2c] text-white py-4 rounded-xl text-lg font-medium hover:bg-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Sauvegarde en cours..."
                : view === "edit"
                ? "✓ Enregistrer les modifications"
                : "✓ Ajouter le tableau"}
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setView("list")}
              className="w-full border border-[#e0d9d0] text-[#9b8b7c] py-3 rounded-xl text-base hover:bg-[#f0ebe4] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all z-50 ${
              toast.ok ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9f6f1] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e0d9d0] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[#2c2c2c]">
              Administration
            </h1>
            <p className="text-sm text-[#9b8b7c]">Manon Sauvé — Galerie</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[#9b8b7c] hover:text-[#2c2c2c] transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Add Button */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#9b8b7c] text-sm">
            {loading
              ? "Chargement..."
              : `${paintings.length} tableau${paintings.length !== 1 ? "x" : ""}`}
          </p>
          <button
            onClick={startAdd}
            className="bg-[#2c2c2c] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#444] transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Ajouter un tableau
          </button>
        </div>

        {/* Seed Banner — shown when no paintings in KV yet */}
        {!loading && paintings.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-center">
            <p className="text-amber-800 font-medium mb-1">
              La galerie est vide
            </p>
            <p className="text-amber-700 text-sm mb-4">
              Importez les 15 tableaux existants ou ajoutez-en un nouveau.
            </p>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {seeding ? "Import en cours..." : "Importer les tableaux existants"}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-[#9b8b7c]">
            Chargement des tableaux...
          </div>
        )}

        {/* Paintings Grid */}
        {!loading && paintings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paintings.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#f0ebe4]"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-[#f0ebe4]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized={p.image.startsWith("http")}
                  />
                </div>

                {/* Info */}
                <div className="p-4 space-y-1">
                  <h3 className="font-serif text-base text-[#2c2c2c] leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#9b8b7c]">
                    {p.medium}
                    {p.dimensions ? ` — ${p.dimensions}` : ""}
                  </p>
                  <p className="text-sm font-medium text-[#2c2c2c]">
                    {p.price} $ CAD
                  </p>
                  <p className="text-xs text-[#bbb]">{p.year}</p>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 border border-[#e0d9d0] text-[#5c5c5c] py-2 rounded-lg text-sm hover:bg-[#f9f6f1] transition-colors"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="flex-1 border border-red-200 text-red-500 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="font-serif text-xl text-[#2c2c2c]">
              Supprimer ce tableau ?
            </h3>
            <p className="text-[#9b8b7c] text-sm">
              Cette action est irréversible. Le tableau sera définitivement
              supprimé de la galerie.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-[#e0d9d0] text-[#5c5c5c] py-3 rounded-xl text-sm hover:bg-[#f9f6f1] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${
            toast.ok ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
