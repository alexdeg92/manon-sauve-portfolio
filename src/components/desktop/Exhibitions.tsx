"use client";

import { useEffect, useState } from "react";
import { Exhibition, localized } from "@/lib/exhibitions";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";

/**
 * Reads the exhibitions Manon enters in the admin. The whole section is hidden
 * while the list is empty rather than showing placeholder shows to visitors.
 */
export default function Exhibitions() {
  const { lang, t } = useSite();
  const [shows, setShows] = useState<Exhibition[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/exhibitions")
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) setShows(data);
      })
      .catch(() => {
        // Nothing to show is the correct fallback here.
      });
    return () => {
      active = false;
    };
  }, []);

  if (shows.length === 0) return null;

  return (
    <section id="expositions" className="mt-[150px] bg-m-ink px-14 py-[120px] text-m-paper">
      <Reveal>
        <div className="grid grid-cols-[1fr_1.4fr] gap-20">
          <div>
            <h2 className="m-0 text-[56px] font-normal leading-[1.02] tracking-[-.03em]">
              {t("Expositions", "Exhibitions")}
              <br />
              <span className="font-editorial font-light italic text-[#9DB3A1]">
                {t("et presse", "& press")}
              </span>
            </h2>
            <p className="mt-7 max-w-[300px] font-editorial text-[17px] leading-[1.65] text-[#B5B1A8]">
              {t(
                "Expositions et mentions choisies. La liste complète est disponible sur demande.",
                "Selected shows and mentions. Full list available on request."
              )}
            </p>
          </div>

          <div>
            {shows.map((show, i) => (
              <Reveal key={show.id} index={i}>
                <div
                  className={`grid grid-cols-[82px_1fr_150px] items-baseline gap-[26px] border-t border-[#33352F] py-6 ${
                    i === shows.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-[14px] text-[#9DB3A1]">{show.year}</span>
                  <div>
                    <div className="font-editorial text-[23px] italic">{show.title}</div>
                    <div className="mt-1.5 text-[13px] text-[#B5B1A8]">
                      {localized(show.venueFr, show.venueEn, lang)}
                    </div>
                  </div>
                  <span className="text-right text-[11px] uppercase tracking-[.16em] text-m-quiet">
                    {localized(show.kindFr, show.kindEn, lang)}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
