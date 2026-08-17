"use client";

import { Painting } from "@/data/paintings";
import { collectionOf } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import type { ScreenName } from "../nav";

export default function Gestion({
  paintings,
  onGoto,
  onLogout,
}: {
  paintings: Painting[];
  onGoto: (screen: ScreenName) => void;
  onLogout: () => void;
}) {
  const { lang, t } = useSite();

  // Collections are derived from the works themselves, so the count is real.
  const seriesCount = new Set(paintings.map((p) => collectionOf(p, lang))).size;

  const rows: { screen: ScreenName; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      screen: "collections",
      title: t("Collections", "Collections"),
      subtitle:
        lang === "en"
          ? `${seriesCount} ${seriesCount === 1 ? "series" : "series"}`
          : `${seriesCount} ${seriesCount === 1 ? "série" : "séries"}`,
      icon: (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M6 7V5h12v2M6 11h12" />
        </>
      ),
    },
    {
      screen: "visites",
      title: t("Visites d'atelier", "Studio visits"),
      subtitle: t("Jours et heures offerts", "Days and times offered"),
      icon: (
        <>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
          <path d="M3.5 9.5h17M8 3v3M16 3v3" />
          <circle cx="12" cy="14.5" r="1.6" />
        </>
      ),
    },
    {
      screen: "expositions",
      title: t("Expositions", "Exhibitions"),
      subtitle: t("Expositions et presse", "Shows and press"),
      icon: (
        <>
          <path d="M4 5h16M6 5v9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5" />
          <path d="M12 17v3M9 20h6" />
        </>
      ),
    },
    {
      screen: "contenu",
      title: t("Contenu du site", "Site content"),
      subtitle: t("Accueil et à propos", "Hero and about text"),
      icon: (
        <>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      ),
    },
    {
      screen: "medias",
      title: t("Médiathèque", "Media library"),
      subtitle:
        lang === "en" ? `${paintings.length} files` : `${paintings.length} fichiers`,
      icon: (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="M3.5 15 8 10.5l3.5 3.5L14 11.5l6.5 6" />
        </>
      ),
    },
  ];

  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
          {t("Gestion", "Manage")}
        </h1>
        <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
          {t("Le reste du portail de l'atelier.", "Everything else in the studio portal.")}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 px-6 pt-[22px]">
        {rows.map((row, i) => (
          <Reveal key={row.screen} index={i}>
            <button
              onClick={() => onGoto(row.screen)}
              className="flex w-full items-center gap-3.5 rounded-[16px] border border-m-line bg-white p-[18px] text-left text-[15px] transition-colors duration-300 hover:border-m-sage-soft"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4A6B4F"
                strokeWidth="1.4"
                className="shrink-0"
              >
                {row.icon}
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block">{row.title}</span>
                <span className="mt-0.5 block text-[12px] text-m-stone">{row.subtitle}</span>
              </span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C9C3B7"
                strokeWidth="1.6"
                className="shrink-0"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </Reveal>
        ))}

        {/* The full portal is a desktop layout, so this is a note, not a link. */}
        <div className="mt-2 flex w-full items-center gap-3.5 rounded-[16px] border border-dashed border-m-line-strong bg-m-sand-soft p-[18px] text-[15px]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A857C"
            strokeWidth="1.4"
            className="shrink-0"
          >
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block text-m-stone-deep">
              {t("Portail complet", "Full portal")}
            </span>
            <span className="mt-0.5 block text-[12px] text-m-stone">
              {t(
                "Ajouter, téléverser et réordonner : sur ordinateur.",
                "Adding, uploading and reordering: on desktop."
              )}
            </span>
          </span>
        </div>

        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center gap-3.5 rounded-[16px] border border-m-line bg-white p-[18px] text-left text-[15px] transition-colors duration-300 hover:border-m-stone-soft"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A857C"
            strokeWidth="1.4"
            className="shrink-0"
          >
            <path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
            <path d="M11 12h10M18 9l3 3-3 3" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block">{t("Se déconnecter", "Sign out")}</span>
            <span className="mt-0.5 block text-[12px] text-m-stone">
              {t("Revenir au mode visiteur", "Back to visitor mode")}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
