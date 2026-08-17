"use client";

import { Painting } from "@/data/paintings";

/** Every image in the catalogue. Uploads go through the add-work drawer so a
 *  file is always attached to a painting rather than orphaned in storage. */
export default function Medias({
  paintings,
  onAdd,
  onEdit,
}: {
  paintings: Painting[];
  onAdd: () => void;
  onEdit: (painting: Painting) => void;
}) {
  const fileName = (src: string) => {
    try {
      const path = src.startsWith("http") ? new URL(src).pathname : src;
      return decodeURIComponent(path.split("/").pop() || src);
    } catch {
      return src;
    }
  };

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="rounded-[14px] border border-dashed border-[#C9C3B7] bg-[#FCFBF8] p-[38px] text-center">
        <div className="font-editorial text-[20px] italic text-m-stone-deep">
          Ajouter une photo d&apos;œuvre
        </div>
        <div className="mt-2 text-[13px] text-m-stone">
          JPEG ou PNG, 2000 px minimum sur le côté long. La photo est rattachée à une œuvre.
        </div>
        <button
          onClick={onAdd}
          className="mt-[18px] rounded-full border border-m-ink bg-transparent px-6 py-3 text-[13px] transition-colors duration-300 hover:bg-m-ink hover:text-m-paper"
        >
          Choisir un fichier
        </button>
      </div>

      <div className="mt-[22px] grid grid-cols-6 gap-3.5">
        {paintings.map((painting) => (
          <button
            key={painting.id}
            onClick={() => onEdit(painting)}
            className="group animate-mRise text-left"
          >
            <div className="aspect-square overflow-hidden rounded-[11px] bg-m-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={painting.image}
                alt={painting.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="mt-2 truncate text-[12px] text-m-stone">
              {fileName(painting.image)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
