"use client";

import { useState } from "react";
import DemoTag from "../DemoTag";

const DEFAULT_TITLE = "Figures, silhouettes et couleur";
const DEFAULT_SUB =
  "Acrylique et techniques mixtes sur toile. Chaque pièce est unique, signée, et expédiée depuis l'atelier de Saint-Joseph-du-Lac.";
const DEFAULT_ABOUT =
  "Née aux Cèdres en 1965, artiste peintre autodidacte, je crée depuis plus de quarante ans. Le dessin reste au centre de ma démarche ; l'acrylique, pour sa polyvalence, en est le médium.";

/**
 * Live preview of the public site's copy. Nothing is persisted: the settings
 * table only holds the profile photo today. Wire `savePublish` to a content
 * setting once one exists.
 */
export default function Contenu({ onToast }: { onToast: (message: string) => void }) {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [sub, setSub] = useState(DEFAULT_SUB);
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  return (
    <div className="animate-mFade grid grid-cols-2 items-start gap-4 px-[38px] py-[26px]">
      <div className="rounded-[14px] border border-[#E9E4DA] bg-white p-[26px]">
        <h2 className="m-0 mb-1 text-[17px] font-normal">Textes du site</h2>
        <div className="text-[13px] text-m-stone">
          Les modifications apparaissent à droite en direct.
        </div>
        <DemoTag className="mt-4">
          L&apos;enregistrement n&apos;est pas encore branché — ces textes vivent dans le code
          pour l&apos;instant.
        </DemoTag>

        <Label>Titre d&apos;accueil</Label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2.5 w-full rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
        />

        <Label>Sous-titre</Label>
        <textarea
          rows={3}
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          className="mt-2.5 w-full resize-y rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
        />

        <Label>À propos</Label>
        <textarea
          rows={6}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="mt-2.5 w-full resize-y rounded-[11px] border border-m-line-strong bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
        />

        <button
          onClick={() => onToast("Pas encore relié — la publication arrivera avec l'API contenu.")}
          className="mt-[18px] rounded-full bg-m-ink px-[26px] py-3.5 text-[13px] text-m-paper"
        >
          Publier les changements
        </button>
      </div>

      <div className="sticky top-[104px] rounded-[14px] border border-[#E9E4DA] bg-m-paper px-[34px] py-10">
        <div className="text-[11px] uppercase tracking-[.16em] text-m-stone">Aperçu</div>
        <h2 className="m-0 mt-[18px] text-[42px] font-normal leading-[1.05] tracking-[-.03em]">
          {title}
        </h2>
        <p className="mt-4 font-editorial text-[18px] leading-[1.6] text-m-stone-deep">{sub}</p>
        <div className="my-7 h-px bg-m-line" />
        <p className="m-0 font-editorial text-[16px] leading-[1.7] text-m-stone-deep">{about}</p>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 text-[11px] uppercase tracking-[.16em] text-m-stone">{children}</div>
  );
}
