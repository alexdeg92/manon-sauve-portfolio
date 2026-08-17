"use client";

import { useState } from "react";
import { DEMO_COLLECTIONS } from "../demo-data";
import { useSite } from "@/components/site/context";
import DemoNote from "../DemoNote";
import SubScreen from "./SubScreen";

export default function Collections({ onBack }: { onBack: () => void }) {
  const { lang, t, say } = useSite();
  const [collections, setCollections] = useState(DEMO_COLLECTIONS);
  const [name, setName] = useState("");

  const add = () => {
    const value = name.trim();
    if (!value) return say(t("Donnez un nom à la collection.", "Name the collection first."));
    setCollections((prev) => [...prev, { name: value, count: 0 }]);
    setName("");
    say(t("Collection créée.", "Collection created."));
  };

  const remove = (target: string) => {
    setCollections((prev) => prev.filter((c) => c.name !== target));
    say(t("Collection retirée.", "Collection removed."));
  };

  return (
    <SubScreen title={t("Collections", "Collections")} onBack={onBack}>
      <div className="px-6 pt-4">
        <DemoNote />
      </div>

      <div className="flex gap-2 px-6 pt-[18px]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={t("Nouvelle collection", "New collection")}
          className="flex-1 rounded-full border border-m-line-strong bg-white px-[18px] py-3 text-[14px] outline-none focus:border-m-sage"
        />
        <button
          onClick={add}
          className="rounded-full bg-m-ink px-5 py-3 text-[13px] text-m-paper"
        >
          {t("Créer", "Create")}
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-[18px]">
        {collections.map((collection) => (
          <div
            key={collection.name}
            className="animate-mRise rounded-[16px] border border-m-line bg-white p-[18px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-editorial text-[20px] italic">{collection.name}</div>
                <div className="mt-1 text-[12px] text-m-stone">
                  {lang === "en"
                    ? `${collection.count} ${collection.count > 1 ? "works" : "work"}`
                    : `${collection.count} ${collection.count > 1 ? "œuvres" : "œuvre"}`}
                </div>
              </div>
              <button
                onClick={() => remove(collection.name)}
                className="shrink-0 rounded-full border border-m-line-strong px-[13px] py-[7px] text-[11px] text-m-stone"
              >
                {t("Retirer", "Remove")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SubScreen>
  );
}
