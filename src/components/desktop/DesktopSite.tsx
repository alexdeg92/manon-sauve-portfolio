"use client";

import { useCallback, useState } from "react";
import { Painting } from "@/data/paintings";
import Header from "./Header";
import Hero from "./Hero";
import Works from "./Works";
import Exhibitions from "./Exhibitions";
import Studio from "./Studio";
import Commission from "./Commission";
import About from "./About";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import WorkOverlay from "./WorkOverlay";

/** The desktop / large-tablet site. See "Site Web" in Claude Design. */
export default function DesktopSite({ paintings }: { paintings: Painting[] }) {
  const [open, setOpen] = useState<Painting | null>(null);
  const [siblings, setSiblings] = useState<Painting[]>([]);
  const [commissionWork, setCommissionWork] = useState<string | null>(null);

  const openWork = useCallback((painting: Painting, visible: Painting[]) => {
    setSiblings(visible);
    setOpen(painting);
  }, []);

  // Enquiring closes the lightbox and drops the visitor into the commission form.
  const enquire = useCallback((painting: Painting) => {
    setOpen(null);
    setCommissionWork(painting.title);
    const target = document.querySelector("#commande");
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="min-w-[1024px] overflow-x-hidden bg-m-paper font-display text-m-ink">
      <Header />
      <main>
        <Hero paintings={paintings} />
        <Works paintings={paintings} onOpen={openWork} />
        <Exhibitions />
        <Studio paintings={paintings} />
        <Commission
          aboutWork={commissionWork}
          onConsumeWork={() => setCommissionWork(null)}
        />
        <About />
        <Newsletter />
      </main>
      <Footer />

      <WorkOverlay
        painting={open}
        siblings={siblings}
        onSelect={setOpen}
        onClose={() => setOpen(null)}
        onEnquire={enquire}
      />
    </div>
  );
}
