"use client";

import { Painting } from "@/data/paintings";
import { CATEGORY_LABELS, categoryOf, formatPrice } from "@/lib/mobile";

type StatusFilter = "all" | "available" | "sold";

interface OeuvresProps {
  paintings: Painting[];
  rows: Painting[];
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
  selected: string[];
  onSelected: (ids: string[]) => void;
  busy: boolean;
  onEdit: (painting: Painting) => void;
  onToggleSold: (painting: Painting) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onBulkSold: (sold: boolean) => void;
  onBulkFeature: () => void;
  onBulkDelete: () => void;
  onSeed: () => void;
  seeding: boolean;
  searching: boolean;
}

const FILTERS: [StatusFilter, string][] = [
  ["all", "Toutes"],
  ["available", "Disponibles"],
  ["sold", "Vendues"],
];

export default function Oeuvres({
  paintings,
  rows,
  statusFilter,
  onStatusFilter,
  selected,
  onSelected,
  busy,
  onEdit,
  onToggleSold,
  onReorder,
  onBulkSold,
  onBulkFeature,
  onBulkDelete,
  onSeed,
  seeding,
  searching,
}: OeuvresProps) {
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggle = (id: string) =>
    onSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="animate-mFade px-[38px] py-[26px]">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex gap-2">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onStatusFilter(key);
                onSelected([]);
              }}
              aria-pressed={statusFilter === key}
              className={`rounded-full border px-[18px] py-[9px] text-[13px] transition-all duration-300 ${
                statusFilter === key
                  ? "border-m-ink bg-m-ink text-m-paper"
                  : "border-m-line-strong bg-white text-m-stone-deep hover:border-m-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-[13px] text-m-stone">
          {rows.length} {rows.length === 1 ? "œuvre affichée" : "œuvres affichées"}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mt-[18px] flex animate-mRise items-center gap-3 rounded-[12px] bg-m-ink px-[18px] py-3.5 text-m-paper">
          <span className="text-[13px]">
            {selected.length} {selected.length === 1 ? "œuvre sélectionnée" : "œuvres sélectionnées"}
          </span>
          <div className="ml-auto flex gap-2">
            <BulkButton onClick={() => onBulkSold(true)} disabled={busy}>
              Marquer vendues
            </BulkButton>
            <BulkButton onClick={() => onBulkSold(false)} disabled={busy}>
              Marquer disponibles
            </BulkButton>
            <BulkButton onClick={onBulkFeature} disabled={busy}>
              Mettre à l&apos;honneur
            </BulkButton>
            <button
              onClick={onBulkDelete}
              disabled={busy}
              className="rounded-full bg-[#7C3B32] px-4 py-[9px] text-[12px] text-m-paper disabled:opacity-50"
            >
              Supprimer
            </button>
            <button
              onClick={() => onSelected([])}
              className="px-2 py-[9px] text-[12px] text-[#B5B1A8]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="mt-[18px] overflow-hidden rounded-[14px] border border-[#E9E4DA] bg-white">
        <div className="grid grid-cols-[46px_84px_2fr_1fr_1fr_.9fr_1fr_92px_74px] items-center gap-4 border-b border-[#EFEAE0] px-5 py-3.5 text-[11px] uppercase tracking-[.14em] text-m-stone">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onSelected(allSelected ? [] : rows.map((p) => p.id))}
            aria-label="Tout sélectionner"
            className="h-4 w-4 cursor-pointer accent-m-ink"
          />
          <span />
          <span>Titre</span>
          <span>Collection</span>
          <span>Format</span>
          <span>Année</span>
          <span>Prix</span>
          <span>Statut</span>
          <span>Ordre</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-[60px] text-center">
            <div className="font-editorial text-[18px] italic text-m-stone">
              {searching || statusFilter !== "all"
                ? "Aucune œuvre ne correspond à cette recherche."
                : "Le catalogue est vide."}
            </div>
            {paintings.length === 0 && (
              <button
                onClick={onSeed}
                disabled={seeding}
                className="mt-4 rounded-full border border-m-ink px-6 py-3 text-[13px] disabled:opacity-50"
              >
                {seeding ? "Import en cours…" : "Importer les œuvres par défaut"}
              </button>
            )}
          </div>
        ) : (
          rows.map((painting) => {
            const index = paintings.findIndex((p) => p.id === painting.id);
            return (
              <div
                key={painting.id}
                className={`grid grid-cols-[46px_84px_2fr_1fr_1fr_.9fr_1fr_92px_74px] items-center gap-4 border-b border-[#F3EFE7] px-5 py-3 transition-colors duration-200 ${
                  selected.includes(painting.id) ? "bg-[#FCFBF8]" : "hover:bg-[#FCFBF8]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(painting.id)}
                  onChange={() => toggle(painting.id)}
                  aria-label={`Sélectionner ${painting.title}`}
                  className="h-4 w-4 cursor-pointer accent-m-ink"
                />
                <button
                  onClick={() => onEdit(painting)}
                  className="h-[74px] w-[60px] overflow-hidden rounded-lg bg-m-sand"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={painting.image}
                    alt={painting.title}
                    className="h-full w-full object-cover"
                  />
                </button>
                <button onClick={() => onEdit(painting)} className="min-w-0 text-left">
                  <div className="truncate font-editorial text-[18px] italic">
                    {painting.title}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-m-stone">{painting.medium}</div>
                </button>
                <span className="text-[13px] text-m-stone-deep">
                  {CATEGORY_LABELS[categoryOf(painting)].fr}
                </span>
                <span className="text-[13px] text-m-stone-deep">{painting.dimensions}</span>
                <span className="text-[13px] text-m-stone-deep">{painting.year}</span>
                {/* Strike through only a real figure; a missing price is just a dash. */}
                <span
                  className={`text-[14px] ${
                    painting.price === null
                      ? "text-m-stone-soft"
                      : painting.sold
                        ? "text-m-stone-soft line-through"
                        : ""
                  }`}
                >
                  {painting.price === null ? "—" : formatPrice(painting.price, "fr")}
                </span>
                <button
                  onClick={() => onToggleSold(painting)}
                  disabled={busy}
                  className={`rounded-full border px-3 py-[7px] text-[11px] tracking-[.06em] transition-all duration-300 disabled:opacity-50 ${
                    painting.sold
                      ? "border-m-ink bg-m-ink text-m-paper"
                      : "border-m-sage-soft bg-transparent text-m-sage"
                  }`}
                >
                  {painting.sold ? "Vendu" : "Disponible"}
                </button>
                <div className="flex gap-1">
                  <OrderButton
                    onClick={() => onReorder(painting.id, "up")}
                    disabled={busy || index <= 0}
                    label={`Monter ${painting.title}`}
                  >
                    ↑
                  </OrderButton>
                  <OrderButton
                    onClick={() => onReorder(painting.id, "down")}
                    disabled={busy || index === -1 || index >= paintings.length - 1}
                    label={`Descendre ${painting.title}`}
                  >
                    ↓
                  </OrderButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BulkButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-[#43453F] bg-transparent px-4 py-[9px] text-[12px] text-m-paper transition-colors duration-300 hover:bg-[#262824] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function OrderButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-7 w-7 rounded-md border border-m-line-strong text-[12px] text-m-stone-deep transition-colors duration-200 hover:border-m-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
