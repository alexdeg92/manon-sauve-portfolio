"use client";

import { EXHIBITIONS } from "./demo-data";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";

export default function Exhibitions() {
  const { lang, t } = useSite();

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
            {EXHIBITIONS.map((show, i) => (
              <Reveal key={`${show.year}-${show.title}`} index={i}>
                <div
                  className={`grid grid-cols-[82px_1fr_150px] items-baseline gap-[26px] border-t border-[#33352F] py-6 ${
                    i === EXHIBITIONS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-[14px] text-[#9DB3A1]">{show.year}</span>
                  <div>
                    <div className="font-editorial text-[23px] italic">{show.title}</div>
                    <div className="mt-1.5 text-[13px] text-[#B5B1A8]">{show.venue[lang]}</div>
                  </div>
                  <span className="text-right text-[11px] uppercase tracking-[.16em] text-m-quiet">
                    {show.kind[lang]}
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
