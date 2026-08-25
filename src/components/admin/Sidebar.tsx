"use client";

import { useRef } from "react";
import { AdminView } from "./types";

interface SidebarProps {
  view: AdminView;
  onView: (view: AdminView) => void;
  newInquiries: number;
  profilePhoto: string;
  uploadingProfile: boolean;
  onProfilePhoto: (file: File) => void;
  onLogout: () => void;
}

const ITEMS: { key: AdminView; label: string; icon: React.ReactNode }[] = [
  {
    key: "bord",
    label: "Tableau de bord",
    icon: <path d="M4 19V9M10 19V5M16 19v-7M21 19H3" />,
  },
  {
    key: "oeuvres",
    label: "Œuvres",
    icon: (
      <>
        <rect x="3.5" y="4.5" width="17" height="15" rx="1.6" />
        <path d="M3.5 15.5 9 10l4.5 4.5L16 12l4.5 4.5" />
        <circle cx="9" cy="8.5" r="1.4" />
      </>
    ),
  },
  {
    key: "demandes",
    label: "Demandes",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.6 6.5 8.4 6 8.4-6" />
      </>
    ),
  },
  {
    key: "collections",
    label: "Collections",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M6 7V5h12v2M6 11h12" />
      </>
    ),
  },
  {
    key: "visites",
    label: "Visites d'atelier",
    icon: (
      <>
        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" />
        <circle cx="12" cy="14.5" r="1.6" />
      </>
    ),
  },
  {
    key: "expositions",
    label: "Expositions",
    icon: (
      <>
        <path d="M4 5h16M6 5v9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5" />
        <path d="M12 17v3M9 20h6" />
      </>
    ),
  },
  {
    key: "contenu",
    label: "Contenu du site",
    icon: (
      <>
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
];

export default function Sidebar({
  view,
  onView,
  newInquiries,
  profilePhoto,
  uploadingProfile,
  onProfilePhoto,
  onLogout,
}: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[34px] bg-m-ink px-5 py-7 text-[#B5B1A8]">
      <div>
        <div className="text-[14px] font-medium uppercase tracking-[.18em] text-m-paper">
          Manon Sauvé
        </div>
        <div className="mt-1 font-editorial text-[13px] italic text-m-quiet">
          Portail de gestion
        </div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {ITEMS.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onView(item.key)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-[11px] rounded-[9px] px-[13px] py-[11px] text-left text-[14px] transition-colors duration-300 ${
                active
                  ? "bg-m-paper/[.09] text-m-paper"
                  : "bg-transparent text-[#B5B1A8] hover:bg-m-paper/[.05]"
              }`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="shrink-0"
              >
                {item.icon}
              </svg>
              {item.label}
              {item.key === "demandes" && newInquiries > 0 && (
                <span className="ml-auto rounded-full bg-m-sage px-2 py-0.5 text-[11px] text-m-paper">
                  {newInquiries}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#2C2E2A] pt-[18px]">
        <div className="flex items-center gap-[11px]">
          <button
            onClick={() => fileRef.current?.click()}
            title="Changer la photo de profil"
            className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full bg-[#2C2E2A]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
          </button>
          <div className="min-w-0">
            <div className="text-[13px] text-m-paper">Manon</div>
            <div className="text-[11px] text-m-quiet">
              {uploadingProfile ? "Envoi de la photo…" : "Administratrice"}
            </div>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onProfilePhoto(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={onLogout}
          className="mt-3.5 w-full rounded-[9px] border border-[#2C2E2A] px-3 py-2 text-[12px] text-[#B5B1A8] transition-colors duration-300 hover:border-[#43453F] hover:text-m-paper"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
