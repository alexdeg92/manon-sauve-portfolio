"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/site/context";

const LINKS = [
  { href: "#oeuvres", fr: "Œuvres", en: "Works" },
  { href: "#expositions", fr: "Expositions", en: "Exhibitions" },
  { href: "#atelier", fr: "Atelier", en: "Studio" },
  { href: "#apropos", fr: "À propos", en: "About" },
];

export default function Header() {
  const { lang, setLang, t } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 40);
      setProgress(height > 0 ? y / height : 0);
    };
    onScroll();
    const handler = () => requestAnimationFrame(onScroll);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div
        className="fixed left-0 top-0 z-[90] h-0.5 w-full origin-left bg-m-sage"
        style={{ transform: `scaleX(${progress})` }}
      />
      <header
        className={`fixed inset-x-0 top-0 z-[80] flex items-center justify-between gap-10 border-b transition-all duration-500 ${
          scrolled
            ? "border-m-line bg-m-paper/[.88] px-14 py-3.5 backdrop-blur-[14px] backdrop-saturate-[180%]"
            : "border-transparent px-14 py-[26px]"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
      >
        <a href="#top" onClick={(e) => jump(e, "#top")} className="flex items-baseline gap-3">
          <span className="text-[17px] font-medium uppercase tracking-[.18em]">Manon Sauvé</span>
          <span className="font-editorial text-[14px] italic text-m-quiet">
            {t("Peintre", "Painter")}
          </span>
        </a>

        <nav className="flex items-center gap-[34px] text-[14px] tracking-[.02em]">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => jump(e, link.href)}
              className="transition-colors duration-300 hover:text-m-sage"
            >
              {lang === "en" ? link.en : link.fr}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-0.5 rounded-full border border-[#D8D3C8] p-[3px]">
            {(["fr", "en"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`rounded-full px-3 py-[5px] text-[12px] tracking-[.08em] transition-colors duration-300 ${
                  lang === code ? "bg-m-ink text-m-paper" : "bg-transparent text-m-quiet"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <a
            href="#commande"
            onClick={(e) => jump(e, "#commande")}
            className="rounded-full border border-m-ink px-[22px] py-[11px] text-[13px] tracking-[.04em] transition-colors duration-500 hover:bg-m-ink hover:text-m-paper"
          >
            {t("Commander une œuvre", "Commission a work")}
          </a>
        </div>
      </header>
    </>
  );
}
