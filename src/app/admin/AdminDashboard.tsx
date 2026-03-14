"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Painting {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  price: number | null;
  image: string;
  year: number;
  sold?: boolean;
}

type FormData = {
  title: string;
  medium: string;
  dimensions: string;
  price: string;
  year: string;
  image: string;
  sold: boolean;
};

const emptyForm: FormData = {
  title: "",
  medium: "",
  dimensions: "",
  price: "",
  year: new Date().getFullYear().toString(),
  image: "",
  sold: false,
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
  const [profilePhoto, setProfilePhoto] = useState<string>("/manon-profile.jpg");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
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

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.profile_photo) setProfilePhoto(data.profile_photo);
    } catch {}
  };

  useEffect(() => {
    loadPaintings();
    loadSettings();
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
      sold: p.sold ?? false,
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
            sold: form.sold,
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

  const handleToggleSold = async (p: Painting) => {
    const newSold = !p.sold;
    setPaintings((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, sold: newSold } : x))
    );
    try {
      const res = await fetch(`/api/paintings/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold: newSold }),
      });
      if (!res.ok) {
        setPaintings((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, sold: !newSold } : x))
        );
        showToast("Erreur lors de la mise à jour", false);
      }
    } catch {
      setPaintings((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, sold: !newSold } : x))
      );
      showToast("Erreur lors de la mise à jour", false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= paintings.length) return;
    const reordered = [...paintings];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setPaintings(reordered);
    try {
      const res = await fetch("/api/paintings/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
      });
      if (!res.ok) {
        showToast("Erreur lors de la réorganisation", false);
        loadPaintings();
      }
    } catch {
      showToast("Erreur lors de la réorganisation", false);
      loadPaintings();
    }
  };

  const handleProfileUpload = async (file: File) => {
    setUploadingProfile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        const newUrl = data.url;
        setProfilePhoto(newUrl);
        const putRes = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_photo: newUrl }),
        });
        if (putRes.ok) {
          showToast("Photo mise à jour ✓", true);
        } else {
          showToast("Erreur lors de la sauvegarde", false);
        }
      } else {
        showToast(data.error || "Erreur upload", false);
      }
    } catch {
      showToast("Erreur lors de l'upload", false);
    } finally {
      setUploadingProfile(false);
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

        {/* Two-column on desktop, stacked on mobile */}
        <div className="max-w-5xl mx-auto p-6 mt-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* LEFT — Image upload (big, sticky on desktop) */}
            <div className="w-full md:w-2/5 md:sticky md:top-6">
              <label className="block text-xs font-semibold text-[#5c5c5c] mb-2 uppercase tracking-wide">
                Photo du tableau *
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl cursor-pointer transition-colors overflow-hidden ${
                  form.image
                    ? "border-green-400 bg-green-50"
                    : "border-[#e0d9d0] bg-white hover:border-[#9b8b7c]"
                }`}
                style={{ minHeight: "360px" }}
                onClick={() => fileRef.current?.click()}
              >
                {form.image ? (
                  <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-2 backdrop-blur-sm">
                      ✓ Photo chargée — cliquer pour changer
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 space-y-3 px-6 text-center" style={{ minHeight: "360px" }}>
                    {uploading ? (
                      <p className="text-[#9b8b7c] text-base">Téléchargement en cours...</p>
                    ) : (
                      <>
                        <div className="text-5xl">📷</div>
                        <p className="text-[#5c5c5c] text-base font-medium">Cliquez pour choisir une photo</p>
                        <p className="text-[#bbb] text-sm">JPG, PNG — max 10 Mo</p>
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
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: "" }))}
                  className="mt-2 text-xs text-[#9b8b7c] underline w-full text-center"
                >
                  Supprimer la photo
                </button>
              )}
            </div>

            {/* RIGHT — Fields */}
            <div className="w-full md:w-3/5 space-y-5">
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
                  onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                  className={inputClass}
                  placeholder="ex. Huile sur toile"
                />
              </Field>

              <Field label="Dimensions">
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
                  className={inputClass}
                  placeholder='ex. 18" × 24"'
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix ($CAD)">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={inputClass}
                    placeholder="ex. 950"
                    min="0"
                  />
                </Field>
                <Field label="Année">
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    className={inputClass}
                    placeholder="ex. 2024"
                    min="2000"
                    max="2100"
                  />
                </Field>
              </div>

              {/* Sold Checkbox */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="sold-checkbox"
                  checked={form.sold}
                  onChange={(e) => setForm((f) => ({ ...f, sold: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#e0d9d0] accent-[#9b8b7c]"
                />
                <label htmlFor="sold-checkbox" className="text-xs font-semibold text-[#5c5c5c] uppercase tracking-wide cursor-pointer">
                  Vendu
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="w-full bg-[#2c2c2c] text-white py-4 rounded-xl text-base font-medium hover:bg-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Sauvegarde en cours..."
                    : view === "edit"
                    ? "✓ Enregistrer les modifications"
                    : "✓ Ajouter le tableau"}
                </button>
              </div>
              <button
                onClick={() => setView("list")}
                className="w-full border border-[#e0d9d0] text-[#9b8b7c] py-3 rounded-xl text-base hover:bg-[#f0ebe4] transition-colors"
              >
                Annuler
              </button>
            </div>
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
            {paintings.map((p, idx) => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-[#f0ebe4] ${p.sold ? "opacity-70" : ""}`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-[#f0ebe4]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className={`object-cover ${p.sold ? "grayscale-[40%]" : ""}`}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized={p.image.startsWith("http")}
                  />
                  {p.sold && (
                    <div className="absolute top-3 left-3 bg-[#9b8b7c] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                      Vendu
                    </div>
                  )}
                  {/* Reorder arrows */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(idx, "up")}
                      disabled={idx === 0}
                      className="bg-white/80 hover:bg-white text-[#2c2c2c] w-7 h-7 rounded-full text-sm flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(idx, "down")}
                      disabled={idx === paintings.length - 1}
                      className="bg-white/80 hover:bg-white text-[#2c2c2c] w-7 h-7 rounded-full text-sm flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↓
                    </button>
                  </div>
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
                    {`${p.price} $ CAD`}
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
                    onClick={() => handleToggleSold(p)}
                    className={`flex-1 border py-2 rounded-lg text-sm transition-colors ${
                      p.sold
                        ? "border-[#9b8b7c] bg-[#9b8b7c] text-white hover:bg-[#8a7a6b]"
                        : "border-[#e0d9d0] text-[#5c5c5c] hover:bg-[#f9f6f1]"
                    }`}
                  >
                    {p.sold ? "✓ Vendu" : "Vendu"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="border border-red-200 text-red-500 py-2 px-3 rounded-lg text-sm hover:bg-red-50 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Photo Section */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-2xl border border-[#f0ebe4] p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[#2c2c2c] mb-4">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#f0ebe4] flex-shrink-0">
              <Image
                src={profilePhoto}
                alt="Photo de profil"
                fill
                className="object-cover"
                unoptimized={profilePhoto.startsWith("http")}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#9b8b7c]">
                Cette photo apparaît dans la section « À propos » du site.
              </p>
              <button
                onClick={() => profileFileRef.current?.click()}
                disabled={uploadingProfile}
                className="bg-[#2c2c2c] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#444] transition-colors disabled:opacity-50"
              >
                {uploadingProfile ? "Téléchargement..." : "Changer la photo"}
              </button>
              <input
                ref={profileFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfileUpload(file);
                }}
              />
            </div>
          </div>
        </div>
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
