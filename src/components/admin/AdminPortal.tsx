"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Painting } from "@/data/paintings";
import { EnquiryStatus, EnquiryWithThread } from "@/lib/enquiries";
import Sidebar from "./Sidebar";
import EditDrawer from "./EditDrawer";
import Bord from "./views/Bord";
import Oeuvres from "./views/Oeuvres";
import Demandes from "./views/Demandes";
import Collections from "./views/Collections";
import Contenu from "./views/Contenu";
import Visites from "./views/Visites";
import Expositions from "./views/Expositions";
import { isPhoneViewport } from "@/lib/admin-target";
import { AdminView, Draft, VIEW_TITLES, draftFrom, emptyDraft } from "./types";

type StatusFilter = "all" | "available" | "sold";

export default function AdminPortal() {
  const router = useRouter();
  // This portal is a 1200px-wide layout. A phone that lands here — bookmark,
  // shared link — is sent to the home page, where the artist mode lives.
  const [onPhone, setOnPhone] = useState(false);

  useEffect(() => {
    if (!isPhoneViewport()) return;
    setOnPhone(true);
    router.replace("/");
  }, [router]);

  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AdminView>("bord");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryWithThread[]>([]);
  const [openInquiryId, setOpenInquiryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("/manon-profile.jpg");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  /**
   * Number of writes in flight. The background refresh skips while this is above
   * zero: a poll that started before a PATCH landed would return the old row and
   * visually undo the change the user just made.
   */
  const pendingWrites = useRef(0);

  const say = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const loadPaintings = useCallback(async () => {
    try {
      const res = await fetch("/api/paintings");
      const data = await res.json();
      if (Array.isArray(data)) setPaintings(data);
    } catch {
      say("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }, [say]);

  const loadEnquiries = useCallback(async () => {
    if (pendingWrites.current > 0) return;
    try {
      const res = await fetch("/api/enquiries");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setEnquiries(data);
    } catch {
      // The catalogue still works without the inbox; stay quiet here.
    }
  }, []);

  useEffect(() => {
    loadPaintings();
    loadEnquiries();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile_photo) setProfilePhoto(d.profile_photo);
      })
      .catch(() => {});
  }, [loadPaintings, loadEnquiries]);

  /**
   * New enquiries arrive while the portal is open, so the inbox is re-read on a
   * timer and whenever the tab regains focus. Without this a request submitted
   * from the site never appears until a manual reload.
   */
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") loadEnquiries();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadEnquiries]);

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const seed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        say("Œuvres importées.");
        loadPaintings();
      } else {
        say(data.error || "Erreur lors de l'import.");
      }
    } catch {
      say("Erreur lors de l'import.");
    } finally {
      setSeeding(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "upload");
    return data.url as string;
  };

  const handleDraftUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setDraft((d) => (d ? { ...d, image: url } : d));
        say("Photo téléversée.");
      }
    } catch {
      say("Erreur lors du téléversement.");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpload = async (file: File) => {
    setUploadingProfile(true);
    try {
      const url = await uploadImage(file);
      if (!url) return;
      setProfilePhoto(url);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_photo: url }),
      });
      say(res.ok ? "Photo de profil mise à jour." : "Erreur lors de l'enregistrement.");
    } catch {
      say("Erreur lors du téléversement.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return say("Le titre est obligatoire.");
    if (!draft.image) return say("Ajoutez une photo.");

    const payload = {
      title: draft.title.trim(),
      medium: draft.medium.trim(),
      dimensions: draft.dimensions.trim(),
      price: draft.price.trim() === "" ? null : Number(draft.price.replace(/[^\d.]/g, "")),
      year: Number(draft.year) || new Date().getFullYear(),
      image: draft.image,
      sold: draft.sold,
      collection: draft.collection.trim() || null,
      note: draft.note.trim() || null,
    };

    setSaving(true);
    try {
      const res = draft.id
        ? await fetch(`/api/paintings/${draft.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/paintings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: `painting-${Date.now()}`, ...payload }),
          });

      if (res.ok) {
        say(draft.id ? "Œuvre modifiée." : "Œuvre ajoutée.");
        setDraft(null);
        loadPaintings();
      } else {
        const data = await res.json();
        say(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      say("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async () => {
    if (!draft?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/paintings/${draft.id}`, { method: "DELETE" });
      if (res.ok) {
        say("Œuvre supprimée.");
        setDraft(null);
        loadPaintings();
      } else {
        say("Erreur lors de la suppression.");
      }
    } catch {
      say("Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSold = async (painting: Painting) => {
    const sold = !painting.sold;
    setPaintings((prev) => prev.map((p) => (p.id === painting.id ? { ...p, sold } : p)));
    try {
      const res = await fetch(`/api/paintings/${painting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPaintings((prev) =>
        prev.map((p) => (p.id === painting.id ? { ...p, sold: !sold } : p))
      );
      say("Erreur lors de la mise à jour.");
    }
  };

  const persistOrder = async (ordered: Painting[]) => {
    const previous = paintings;
    setPaintings(ordered);
    try {
      const res = await fetch("/api/paintings/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ordered.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPaintings(previous);
      say("Erreur lors de la réorganisation.");
    }
  };

  const reorder = (id: string, direction: "up" | "down") => {
    const index = paintings.findIndex((p) => p.id === id);
    const next = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || next < 0 || next >= paintings.length) return;
    const ordered = [...paintings];
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    persistOrder(ordered);
  };

  /** Bulk sold/available: one PUT per work, then reload from the source of truth. */
  const bulkSold = async (sold: boolean) => {
    setBusy(true);
    try {
      const results = await Promise.all(
        selected.map((id) =>
          fetch(`/api/paintings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sold }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok).length;
      say(
        failed
          ? `${failed} œuvre(s) n'ont pas pu être mises à jour.`
          : `${selected.length} œuvre(s) marquée(s) ${sold ? "vendues" : "disponibles"}.`
      );
      setSelected([]);
      await loadPaintings();
    } finally {
      setBusy(false);
    }
  };

  /** Featuring moves the selection to the front, which is what the site reads. */
  const bulkFeature = async () => {
    setBusy(true);
    try {
      const picked = paintings.filter((p) => selected.includes(p.id));
      const rest = paintings.filter((p) => !selected.includes(p.id));
      await persistOrder([...picked, ...rest]);
      say(`${picked.length} œuvre(s) mise(s) à l'honneur.`);
      setSelected([]);
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selected.length} œuvre(s) ? Cette action est définitive.`))
      return;
    setBusy(true);
    try {
      const results = await Promise.all(
        selected.map((id) => fetch(`/api/paintings/${id}`, { method: "DELETE" }))
      );
      const failed = results.filter((r) => !r.ok).length;
      say(failed ? `${failed} suppression(s) ont échoué.` : `${selected.length} œuvre(s) supprimée(s).`);
      setSelected([]);
      await loadPaintings();
    } finally {
      setBusy(false);
    }
  };

  const markEnquiryRead = async (id: string, read: boolean) => {
    const previous = enquiries;
    pendingWrites.current += 1;
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, readAt: read ? new Date().toISOString() : null } : e
      )
    );
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setEnquiries(previous);
    } finally {
      pendingWrites.current -= 1;
    }
  };

  /**
   * Opening an enquiry marks it read, which is what makes the sidebar count
   * drain. Only a deliberate click does this: the panel's auto-selected first
   * row must not silently clear the badge.
   */
  const openEnquiry = (id: string) => {
    setOpenInquiryId(id);
    const target = enquiries.find((e) => e.id === id);
    if (target && !target.readAt) markEnquiryRead(id, true);
  };

  /** Optimistic so the pills respond instantly; reverted if the PATCH fails. */
  const setEnquiryStatus = async (id: string, status: EnquiryStatus) => {
    const previous = enquiries;
    pendingWrites.current += 1;
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      say("Statut mis à jour.");
    } catch {
      setEnquiries(previous);
      say("Erreur lors de la mise à jour du statut.");
    } finally {
      pendingWrites.current -= 1;
    }
  };

  /** Resolves true when Resend accepted the reply, so the form can clear itself. */
  const replyToEnquiry = async (id: string, body: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/enquiries/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        say(data.error || "L'envoi a échoué.");
        return false;
      }
      say("Réponse envoyée.");
      await loadEnquiries();
      return true;
    } catch {
      say("L'envoi a échoué.");
      return false;
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return paintings.filter((p) => {
      const statusOk =
        statusFilter === "all" || (statusFilter === "sold" ? Boolean(p.sold) : !p.sold);
      const queryOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.medium.toLowerCase().includes(q) ||
        String(p.year).includes(q);
      return statusOk && queryOk;
    });
  }, [paintings, query, statusFilter]);

  /** Collection names already in the catalogue, offered in the edit drawer. */
  const knownCollections = useMemo(
    () =>
      Array.from(
        new Set(
          paintings
            .map((p) => p.collection?.trim())
            .filter((c): c is string => Boolean(c))
        )
      ).sort(),
    [paintings]
  );

  const openEdit = (painting: Painting) => setDraft(draftFrom(painting));
  const openAdd = () => setDraft(emptyDraft());

  const [title, subtitle] = VIEW_TITLES[view];
  // Inbox badge counts unread, which is independent of conversation status.
  const newInquiries = enquiries.filter((e) => !e.readAt).length;

  // Avoid flashing the desktop layout during the redirect off a phone.
  if (onPhone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-m-sand-soft px-6 text-center font-display text-m-stone">
        <span className="font-editorial text-[17px] italic">Ouverture du mode artiste…</span>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen min-w-[1200px] grid-cols-[250px_1fr] bg-m-sand-soft font-display text-m-ink">
      <Sidebar
        view={view}
        onView={(next) => {
          setView(next);
          setSelected([]);
        }}
        newInquiries={newInquiries}
        profilePhoto={profilePhoto}
        uploadingProfile={uploadingProfile}
        onProfilePhoto={handleProfileUpload}
        onLogout={logout}
      />

      <main className="pb-[70px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-[26px] border-b border-[#E3DED4] bg-m-sand-soft/90 px-[38px] py-5 backdrop-blur-[14px] backdrop-saturate-[180%]">
          <div>
            <h1 className="m-0 text-[24px] font-normal tracking-[-.02em]">{title}</h1>
            <div className="mt-1 text-[13px] text-m-stone">{subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value && view === "bord") setView("oeuvres");
              }}
              placeholder="Rechercher une œuvre…"
              className="w-[300px] rounded-full border border-m-line-strong bg-white px-[18px] py-[11px] text-[13px] outline-none focus:border-m-sage"
            />
            <button
              onClick={openAdd}
              className="rounded-full bg-m-ink px-5 py-3 text-[13px] text-m-paper transition-transform duration-300 hover:-translate-y-0.5"
            >
              Ajouter une œuvre
            </button>
          </div>
        </header>

        {loading ? (
          <div className="px-[38px] py-20 text-center font-editorial text-[18px] italic text-m-stone">
            Chargement du catalogue…
          </div>
        ) : (
          <>
            {view === "bord" && (
              <Bord
                paintings={paintings}
                enquiries={enquiries}
                onView={setView}
                onEdit={openEdit}
                onOpenInquiry={(id) => {
                  openEnquiry(id);
                  setView("demandes");
                }}
              />
            )}
            {view === "oeuvres" && (
              <Oeuvres
                paintings={paintings}
                rows={rows}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
                selected={selected}
                onSelected={setSelected}
                busy={busy}
                onEdit={openEdit}
                onToggleSold={toggleSold}
                onReorder={reorder}
                onBulkSold={bulkSold}
                onBulkFeature={bulkFeature}
                onBulkDelete={bulkDelete}
                onSeed={seed}
                seeding={seeding}
                searching={query.trim().length > 0}
              />
            )}
            {view === "demandes" && (
              <Demandes
                enquiries={enquiries}
                paintings={paintings}
                openId={openInquiryId}
                onOpenId={openEnquiry}
                onRead={markEnquiryRead}
                onStatus={setEnquiryStatus}
                onReply={replyToEnquiry}
                onToast={say}
              />
            )}
            {view === "collections" && (
              <Collections paintings={paintings} onEdit={openEdit} />
            )}
            {view === "contenu" && <Contenu onToast={say} />}
            {view === "visites" && <Visites onToast={say} />}
            {view === "expositions" && <Expositions onToast={say} />}
          </>
        )}
      </main>

      <EditDrawer
        draft={draft}
        collections={knownCollections}
        saving={saving}
        uploading={uploading}
        onChange={setDraft}
        onUpload={handleDraftUpload}
        onSave={saveDraft}
        onDelete={deleteDraft}
        onClose={() => setDraft(null)}
      />

      {toast && (
        <div className="fixed bottom-[26px] left-[274px] z-[70] animate-mFade rounded-[12px] bg-m-ink px-5 py-3.5 text-[13px] text-m-paper shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
