"use client";

import { useCallback, useState, useEffect } from "react";
import { SiteProvider } from "@/components/site/context";
import MobileApp from "@/components/mobile/MobileApp";
import DesktopSite from "@/components/desktop/DesktopSite";
import { Painting, paintings as staticPaintings } from "@/data/paintings";

export default function Home() {
  const [paintings, setPaintings] = useState<Painting[]>(staticPaintings);

  // Fetch latest paintings from the database (admin-managed), fallback to static
  useEffect(() => {
    fetch("/api/paintings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPaintings(data);
        }
        // If empty or error, keep the static data as fallback
      })
      .catch(() => {
        // Keep static data on error — gallery always shows something
      });
  }, []);

  // The mobile artist mode edits prices and availability in place.
  const handlePaintingUpdated = useCallback((updated: Painting) => {
    setPaintings((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  return (
    // One provider so the FR/EN choice survives a resize across the breakpoint.
    <SiteProvider>
      <div className="md:hidden">
        <MobileApp paintings={paintings} onPaintingUpdated={handlePaintingUpdated} />
      </div>
      <div className="hidden md:block">
        <DesktopSite paintings={paintings} />
      </div>
    </SiteProvider>
  );
}
