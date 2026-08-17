"use client";

import { useSite } from "@/components/site/context";

const EMAIL = "manonsauve1965@gmail.com";
const INSTAGRAM = "https://www.instagram.com/manonsauve_art";

export default function Footer() {
  const { t } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-m-ink px-14 pb-10 pt-20 text-[#B5B1A8]">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-[50px] border-b border-[#33352F] pb-[60px]">
        <div>
          <div className="text-[17px] font-medium uppercase tracking-[.18em] text-m-paper">
            Manon Sauvé
          </div>
          <p className="mt-4 max-w-[280px] font-editorial text-[16px] leading-[1.6]">
            {t(
              "Peintre · Atelier de Saint-Joseph-du-Lac. Visites sur rendez-vous.",
              "Painter · Saint-Joseph-du-Lac studio. Visits by appointment."
            )}
          </p>
        </div>

        <FooterColumn title={t("Parcourir", "Browse")}>
          <a href="#oeuvres" className="text-[#B5B1A8] hover:text-m-paper">
            {t("Œuvres", "Works")}
          </a>
          <a href="#expositions" className="text-[#B5B1A8] hover:text-m-paper">
            {t("Expositions", "Exhibitions")}
          </a>
          <a href="#atelier" className="text-[#B5B1A8] hover:text-m-paper">
            {t("Visite d'atelier", "Studio visit")}
          </a>
        </FooterColumn>

        <FooterColumn title={t("Contact", "Contact")}>
          <a href={`mailto:${EMAIL}`} className="text-[#B5B1A8] hover:text-m-paper">
            {EMAIL}
          </a>
          <a href="#commande" className="text-[#B5B1A8] hover:text-m-paper">
            {t("Commander une œuvre", "Commission a work")}
          </a>
        </FooterColumn>

        <FooterColumn title={t("Suivre", "Follow")}>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B5B1A8] hover:text-m-paper"
          >
            Instagram — @manonsauve_art
          </a>
        </FooterColumn>
      </div>

      <div className="flex justify-between gap-5 pt-[26px] text-[12px] text-m-quiet">
        <span>© {year} Manon Sauvé</span>
        <span>
          {t("Toutes les œuvres sont originales et signées", "All works are original and signed")}
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 text-[14px]">
      <div className="text-[11px] uppercase tracking-[.16em] text-m-quiet">{title}</div>
      {children}
    </div>
  );
}
