"use client";

import { useCallback, useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { EnquiryStatus, EnquiryWithThread } from "@/lib/enquiries";
import { useSite } from "@/components/site/context";
import { ARTIST_TABS, MODE_OF, Mode, PARENT_TAB, ScreenName, VISITOR_TABS } from "./nav";
import Accueil from "./screens/Accueil";
import Galerie from "./screens/Galerie";
import Favoris from "./screens/Favoris";
import Atelier from "./screens/Atelier";
import Bord from "./screens/Bord";
import Oeuvres from "./screens/Oeuvres";
import Demandes from "./screens/Demandes";
import Gestion from "./screens/Gestion";
import Collections from "./screens/Collections";
import Visites from "./screens/Visites";
import Expositions from "./screens/Expositions";
import Contenu from "./screens/Contenu";
import Medias from "./screens/Medias";
import WorkSheet from "./WorkSheet";
import EnquirySheet from "./EnquirySheet";
import TabBar from "./TabBar";

interface MobileAppProps {
  paintings: Painting[];
  onPaintingUpdated: (painting: Painting) => void;
}

/** The page provides SiteProvider so language carries across the breakpoint. */
export default function MobileApp({ paintings, onPaintingUpdated }: MobileAppProps) {
  const { toast, say, t } = useSite();
  const [screen, setScreen] = useState<ScreenName>("accueil");
  const [isAdmin, setIsAdmin] = useState(false);
  const [workSheet, setWorkSheet] = useState<Painting | null>(null);
  const [enquiry, setEnquiry] = useState<{ open: boolean; painting: Painting | null }>({
    open: false,
    painting: null,
  });
  const [enquiries, setEnquiries] = useState<EnquiryWithThread[]>([]);

  // The session cookie is httpOnly, so the server decides whether the artist
  // mode is offered at all. A failed check simply leaves it hidden.
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data?.authed)))
      .catch(() => setIsAdmin(false));
  }, []);

  const loadEnquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/enquiries");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setEnquiries(data);
    } catch {
      // The visitor side does not depend on this; stay quiet.
    }
  }, []);

  // Only the artist mode reads the inbox, so wait until the session is confirmed.
  useEffect(() => {
    if (isAdmin) loadEnquiries();
    else setEnquiries([]);
  }, [isAdmin, loadEnquiries]);

  // Same reasoning as the desktop portal: re-read the inbox on a timer and on
  // focus so a request submitted from the site shows up without a reload.
  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin, loadEnquiries]);

  /** Optimistic so the pills respond instantly; reverted if the PATCH fails. */
  const setEnquiryStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      let previous: EnquiryWithThread[] = [];
      setEnquiries((prev) => {
        previous = prev;
        return prev.map((e) => (e.id === id ? { ...e, status } : e));
      });
      try {
        const res = await fetch(`/api/enquiries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error();
        say(t("Statut mis à jour.", "Status updated."));
      } catch {
        setEnquiries(previous);
        say(t("Erreur lors de la mise à jour.", "Could not update the status."));
      }
    },
    [say, t]
  );

  const replyToEnquiry = useCallback(
    async (id: string, body: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/enquiries/${id}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        const data = await res.json();
        if (!res.ok) {
          say(data.error || t("L'envoi a échoué.", "Sending failed."));
          return false;
        }
        say(t("Réponse envoyée.", "Reply sent."));
        await loadEnquiries();
        return true;
      } catch {
        say(t("L'envoi a échoué.", "Sending failed."));
        return false;
      }
    },
    [loadEnquiries, say, t]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      let previous: EnquiryWithThread[] = [];
      setEnquiries((prev) => {
        previous = prev;
        return prev.filter((e) => e.id !== id);
      });
      try {
        const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        say(t("Demande supprimée.", "Inquiry deleted."));
      } catch {
        setEnquiries(previous);
        say(t("Erreur lors de la suppression.", "Could not delete."));
      }
    },
    [say, t]
  );

  const goto = useCallback((next: ScreenName) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // If the session ends while an artist screen is open, fall back to the home tab.
  useEffect(() => {
    if (!isAdmin && MODE_OF[screen] === "artiste") setScreen("accueil");
  }, [isAdmin, screen]);

  const mode: Mode = MODE_OF[screen];
  const activeTab = PARENT_TAB[screen] ?? screen;

  const openWork = useCallback((painting: Painting) => setWorkSheet(painting), []);

  // Signing out drops the artist tabs and returns to the visitor home.
  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // Clearing the local flag still hides the artist mode this session.
    }
    setIsAdmin(false);
    goto("accueil");
    say(t("Déconnecté.", "Signed out."));
  }, [goto, say, t]);

  const openEnquiry = useCallback((painting: Painting | null) => {
    setWorkSheet(null);
    // Let the work sheet finish sliding out before the form slides in.
    setTimeout(() => setEnquiry({ open: true, painting }), 300);
  }, []);

  return (
    <div className="min-h-screen bg-m-paper font-display text-m-ink">
      <main className="pb-40 pt-4">
        {screen === "accueil" && (
          <Accueil paintings={paintings} onOpenWork={openWork} onGoto={goto} />
        )}
        {screen === "galerie" && <Galerie paintings={paintings} onOpenWork={openWork} />}
        {screen === "favoris" && <Favoris paintings={paintings} onOpenWork={openWork} />}
        {screen === "atelier" && (
          <Atelier paintings={paintings} onOpenCommission={() => openEnquiry(null)} />
        )}

        {isAdmin && screen === "bord" && (
          <Bord paintings={paintings} enquiries={enquiries} onGoto={goto} />
        )}
        {isAdmin && screen === "oeuvres" && (
          <Oeuvres paintings={paintings} onUpdated={onPaintingUpdated} />
        )}
        {isAdmin && screen === "demandes" && (
          <Demandes
            enquiries={enquiries}
            paintings={paintings}
            onStatus={setEnquiryStatus}
            onReply={replyToEnquiry}
            onDelete={deleteEnquiry}
          />
        )}
        {isAdmin && screen === "gestion" && (
          <Gestion paintings={paintings} onGoto={goto} onLogout={logout} />
        )}
        {isAdmin && screen === "collections" && (
          <Collections paintings={paintings} onBack={() => goto("gestion")} />
        )}
        {isAdmin && screen === "visites" && <Visites onBack={() => goto("gestion")} />}
        {isAdmin && screen === "expositions" && <Expositions onBack={() => goto("gestion")} />}
        {isAdmin && screen === "contenu" && <Contenu onBack={() => goto("gestion")} />}
        {isAdmin && screen === "medias" && (
          <Medias paintings={paintings} onBack={() => goto("gestion")} />
        )}
      </main>

      <WorkSheet
        painting={workSheet}
        open={Boolean(workSheet)}
        onClose={() => setWorkSheet(null)}
        onEnquire={openEnquiry}
      />
      <EnquirySheet
        open={enquiry.open}
        painting={enquiry.painting}
        onClose={() => setEnquiry({ open: false, painting: null })}
      />

      {toast && (
        <div className="fixed inset-x-5 bottom-[124px] z-[80] animate-mFade rounded-[14px] bg-m-ink px-[18px] py-3.5 text-[13px] text-m-paper shadow-lg">
          {toast}
        </div>
      )}

      <TabBar
        mode={mode}
        activeTab={activeTab}
        tabs={mode === "artiste" ? ARTIST_TABS : VISITOR_TABS}
        showModeSwitch={isAdmin}
        newInquiries={enquiries.filter((e) => e.status === "new").length}
        onModeChange={(next) => goto(next === "artiste" ? "bord" : "accueil")}
        onTabChange={goto}
      />
    </div>
  );
}
