"use client";

import { useState } from "react";
import { useSite } from "@/components/site/context";
import DemoNote from "../DemoNote";
import SubScreen from "./SubScreen";

const DEFAULT_TITLE = "Figures, silhouettes et couleur";
const DEFAULT_SUB =
  "Acrylique et techniques mixtes sur toile. Chaque pièce est unique, signée, et expédiée depuis l'atelier de Saint-Joseph-du-Lac.";

export default function Contenu({ onBack }: { onBack: () => void }) {
  const { t, say } = useSite();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUB);

  return (
    <SubScreen title={t("Contenu du site", "Site content")} onBack={onBack}>
      <div className="px-6 pt-4">
        <DemoNote />
      </div>

      <div className="px-6 pt-5">
        <div className="text-[10px] uppercase tracking-[.16em] text-m-stone">
          {t("Titre d'accueil", "Home title")}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2.5 w-full rounded-[12px] border border-m-line-strong bg-white px-[15px] py-3.5 text-[14px] outline-none focus:border-m-sage"
        />

        <div className="mt-[18px] text-[10px] uppercase tracking-[.16em] text-m-stone">
          {t("Sous-titre", "Subtitle")}
        </div>
        <textarea
          rows={3}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-2.5 w-full resize-y rounded-[12px] border border-m-line-strong bg-white px-[15px] py-3.5 text-[14px] outline-none focus:border-m-sage"
        />

        <div className="mt-[22px] text-[10px] uppercase tracking-[.16em] text-m-stone">
          {t("Aperçu", "Preview")}
        </div>
        <div className="mt-2.5 rounded-[16px] border border-m-line bg-white p-[22px]">
          <div className="text-[26px] leading-[1.1] tracking-[-.02em]">{title}</div>
          <div className="mt-2.5 font-editorial text-[15px] leading-[1.6] text-m-stone-deep">
            {subtitle}
          </div>
        </div>

        <button
          onClick={() =>
            say(
              t(
                "Pas encore relié — la publication arrivera avec l'API contenu.",
                "Not wired yet — publishing lands with the content API."
              )
            )
          }
          className="mt-[18px] w-full rounded-full bg-m-ink py-4 text-[14px] text-m-paper"
        >
          {t("Publier les changements", "Publish changes")}
        </button>
      </div>
    </SubScreen>
  );
}
