"use client";

import { useState } from "react";
import { Painting } from "@/data/paintings";
import { useSite } from "@/components/site/context";
import PaintingImage from "@/components/site/PaintingImage";
import SwipeRow from "../SwipeRow";

interface OeuvresProps {
  paintings: Painting[];
  onUpdated: (painting: Painting) => void;
  onAdd: () => void;
  onEdit: (painting: Painting) => void;
  onDelete: (painting: Painting) => Promise<boolean>;
}

/** Price and availability edits go straight to PUT /api/paintings/:id. */
export default function Oeuvres({ paintings, onUpdated, onAdd, onEdit, onDelete }: OeuvresProps) {
  const { t } = useSite();

  return (
    <div className="animate-mFade">
      <div className="flex items-end justify-between px-6 pt-3.5">
        <div>
          <h1 className="m-0 text-[32px] font-normal tracking-[-.03em]">
            {t("Mes œuvres", "My works")}
          </h1>
          <p className="mt-1.5 font-editorial text-[15px] italic text-m-quiet">
            {t(
              "Touchez la photo pour tout modifier, glissez pour supprimer.",
              "Tap the photo to edit everything, swipe to delete."
            )}
          </p>
        </div>
        {/* Opens the add sheet, which uploads the photo from the phone. */}
        <button
          onClick={onAdd}
          className="shrink-0 rounded-full bg-m-ink px-[18px] py-2.5 text-[13px] text-m-paper"
        >
          {t("Ajouter", "Add")}
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-[22px]">
        {paintings.map((painting) => (
          <WorkRow
            key={painting.id}
            painting={painting}
            onUpdated={onUpdated}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function WorkRow({
  painting,
  onUpdated,
  onEdit,
  onDelete,
}: {
  painting: Painting;
  onUpdated: (painting: Painting) => void;
  onEdit: (painting: Painting) => void;
  onDelete: (painting: Painting) => Promise<boolean>;
}) {
  const { t, say } = useSite();
  const [price, setPrice] = useState(painting.price === null ? "" : String(painting.price));
  const [busy, setBusy] = useState(false);
  /** A swipe arms the delete; the row then asks before the request goes out. */
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async (patch: Partial<Painting>, message: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/paintings/${painting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(String(res.status));
      const updated = await res.json();
      onUpdated(updated);
      say(message);
    } catch {
      setPrice(painting.price === null ? "" : String(painting.price));
      say(t("Échec de l'enregistrement.", "Could not save."));
    } finally {
      setBusy(false);
    }
  };

  const commitPrice = () => {
    const parsed = price.trim() === "" ? null : Number(price.replace(/[^\d.]/g, ""));
    if (parsed === painting.price) return;
    if (parsed !== null && Number.isNaN(parsed)) {
      setPrice(painting.price === null ? "" : String(painting.price));
      return say(t("Prix invalide.", "Invalid price."));
    }
    save({ price: parsed }, t("Prix mis à jour.", "Price updated."));
  };

  const toggleSold = () => {
    const sold = !painting.sold;
    save(
      { sold },
      sold
        ? t(`${painting.title} marqué vendu.`, `${painting.title} marked as sold.`)
        : t(`${painting.title} marqué disponible.`, `${painting.title} marked as available.`)
    );
  };

  const remove = async () => {
    setBusy(true);
    // The row disappears with the painting on success, so nothing to reset.
    const ok = await onDelete(painting);
    if (!ok) {
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-3 rounded-[16px] border border-[#DCC7C3] bg-[#FCF7F6] p-3.5">
        <div className="min-w-0 flex-1">
          <div className="truncate font-editorial text-[16px] italic">{painting.title}</div>
          <div className="mt-0.5 text-[12px] text-m-stone">
            {t("Retirer cette œuvre de la galerie ?", "Remove this work from the gallery?")}
          </div>
        </div>
        <button
          onClick={() => setConfirmDelete(false)}
          disabled={busy}
          className="shrink-0 rounded-full border border-m-line-strong px-3.5 py-[9px] text-[12px] disabled:opacity-50"
        >
          {t("Annuler", "Cancel")}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="shrink-0 rounded-full bg-[#B4534A] px-3.5 py-[9px] text-[12px] text-white disabled:opacity-50"
        >
          {t("Supprimer", "Delete")}
        </button>
      </div>
    );
  }

  return (
    <SwipeRow
      rightActionLabel={t("Modifier", "Edit")}
      onSwipeRight={() => onEdit(painting)}
      leftActionLabel={t("Supprimer", "Delete")}
      onSwipeLeft={() => setConfirmDelete(true)}
      destructive="left"
    >
      <div className="flex items-center gap-3.5 rounded-[16px] border border-m-line bg-m-paper p-3.5">
        {/* The thumbnail and title open the full sheet: photo, note, everything. */}
        <button
          onClick={() => onEdit(painting)}
          aria-label={t(`Modifier ${painting.title}`, `Edit ${painting.title}`)}
          className="relative h-[70px] w-14 shrink-0 overflow-hidden rounded-[10px] bg-m-sand"
        >
          <PaintingImage src={painting.image} alt="" sizes="56px" />
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={() => onEdit(painting)} className="block w-full text-left">
            <div className="truncate font-editorial text-[17px] italic">{painting.title}</div>
            <div className="mt-0.5 truncate text-[12px] text-m-stone">
              {painting.year} · {painting.dimensions}
            </div>
          </button>
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={commitPrice}
              inputMode="numeric"
              disabled={busy}
              aria-label={t("Prix", "Price")}
              className="w-[86px] rounded-lg border border-m-line-strong bg-transparent px-2.5 py-1.5 text-[13px] outline-none focus:border-m-sage"
            />
            <span className="text-[13px] text-m-stone">$</span>
          </div>
        </div>
        <button
          onClick={toggleSold}
          disabled={busy}
          className={`shrink-0 rounded-full border px-3.5 py-[9px] text-[12px] transition-all duration-300 disabled:opacity-60 ${
            painting.sold
              ? "border-m-ink bg-m-ink text-m-paper"
              : "border-m-sage-soft bg-transparent text-m-sage"
          }`}
        >
          {painting.sold ? t("Vendu", "Sold") : t("Disponible", "Available")}
        </button>
      </div>
    </SwipeRow>
  );
}
