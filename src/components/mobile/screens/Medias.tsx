"use client";

import { Painting } from "@/data/paintings";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";
import PaintingImage from "@/components/site/PaintingImage";
import SubScreen from "./SubScreen";

export default function Medias({
  paintings,
  onBack,
  onAdd,
}: {
  paintings: Painting[];
  onBack: () => void;
  onAdd: () => void;
}) {
  const { t } = useSite();

  return (
    <SubScreen title={t("Médiathèque", "Media library")} onBack={onBack}>
      <Reveal className="mx-6 mt-5">
        <div className="rounded-[16px] border border-dashed border-[#C9C3B7] bg-[#FCFBF8] p-[26px] text-center">
          <div className="font-editorial text-[17px] italic text-m-stone-deep">
            {t("Ajouter une photo depuis le téléphone", "Add a photo from your phone")}
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-m-stone">
            {t(
              "La photo est téléversée puis rattachée à une œuvre de la galerie.",
              "The photo is uploaded and then attached to a work in the gallery."
            )}
          </p>
          <button
            onClick={onAdd}
            className="mt-[18px] rounded-full bg-m-ink px-6 py-3 text-[13px] text-m-paper"
          >
            {t("Choisir une photo", "Choose a photo")}
          </button>
        </div>
      </Reveal>

      <Reveal index={1}>
        <div className="grid grid-cols-3 gap-2.5 px-6 pt-[18px]">
          {paintings.map((painting) => (
            <div
              key={painting.id}
              className="relative aspect-square overflow-hidden rounded-[10px] bg-m-sand"
            >
              <PaintingImage src={painting.image} alt={painting.title} sizes="33vw" />
            </div>
          ))}
        </div>
      </Reveal>
    </SubScreen>
  );
}
