"use client";

import { useSite } from "@/components/site/context";
import { Mode, ScreenName } from "./nav";

interface TabBarProps {
  mode: Mode;
  activeTab: ScreenName;
  tabs: ScreenName[];
  showModeSwitch: boolean;
  newInquiries: number;
  onModeChange: (mode: Mode) => void;
  onTabChange: (screen: ScreenName) => void;
}

export default function TabBar({
  mode,
  activeTab,
  tabs,
  showModeSwitch,
  newInquiries,
  onModeChange,
  onTabChange,
}: TabBarProps) {
  const { t } = useSite();

  const label: Record<ScreenName, string> = {
    accueil: t("Accueil", "Home"),
    galerie: t("Galerie", "Gallery"),
    favoris: t("Favoris", "Saved"),
    atelier: t("Atelier", "Studio"),
    bord: t("Aujourd'hui", "Today"),
    oeuvres: t("Œuvres", "Works"),
    demandes: t("Demandes", "Inbox"),
    gestion: t("Gestion", "Manage"),
    collections: t("Collections", "Collections"),
    visites: t("Visites", "Visits"),
    expositions: t("Expositions", "Exhibitions"),
    contenu: t("Contenu", "Content"),
    medias: t("Médias", "Media"),
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[50] border-t border-m-line bg-m-paper/[.92] px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-[16px] backdrop-saturate-[180%]">
      {showModeSwitch && (
        <div className="mx-auto mb-2.5 flex w-[212px] gap-[3px] rounded-full border border-m-line-strong bg-m-sand-soft p-[3px]">
          {(["visiteur", "artiste"] as Mode[]).map((option) => (
            <button
              key={option}
              onClick={() => onModeChange(option)}
              aria-pressed={mode === option}
              className={`flex-1 rounded-full py-2 text-[12px] tracking-[.04em] transition-colors duration-300 ${
                mode === option ? "bg-m-ink text-m-paper" : "bg-transparent text-m-stone"
              }`}
            >
              {option === "visiteur" ? t("Visiteur", "Visitor") : t("Artiste", "Artist")}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-around">
        {tabs.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-[60px] flex-col items-center gap-[5px] px-3.5 py-1.5 transition-colors duration-300 ${
                active ? "text-m-ink" : "text-m-stone-soft"
              }`}
            >
              <TabIcon tab={tab} />
              {tab === "demandes" && newInquiries > 0 && (
                <span className="absolute right-3.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-m-sage px-1 text-[10px] text-m-paper">
                  {newInquiries}
                </span>
              )}
              <span className="text-[10px] tracking-[.04em]">{label[tab]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ tab }: { tab: ScreenName }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
  } as const;

  switch (tab) {
    case "accueil":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "galerie":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
        </svg>
      );
    case "favoris":
      return (
        <svg {...common}>
          <path d="M12 20.5 4.5 13a4.6 4.6 0 0 1 7.5-5.3A4.6 4.6 0 0 1 19.5 13z" />
        </svg>
      );
    case "atelier":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6.5 20V9.5L12 4l5.5 5.5V20" />
          <path d="M10 20v-4.5h4V20" />
        </svg>
      );
    case "bord":
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M21 19H3" />
        </svg>
      );
    case "oeuvres":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="1.6" />
          <path d="M3.5 15.5 9 10l4.5 4.5L16 12l4.5 4.5" />
          <circle cx="9" cy="8.5" r="1.4" />
        </svg>
      );
    case "demandes":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.6 6.5 8.4 6 8.4-6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
  }
}
