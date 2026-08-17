import { Painting } from "@/data/paintings";

export type Lang = "fr" | "en";

export type Category = "portrait" | "silhouette" | "danse" | "abstrait" | "autre";

const CATEGORY_KEYWORDS: [Category, string[]][] = [
  ["danse", ["ballet", "pointes", "flamenco", "dansant", "danse"]],
  ["abstrait", ["abstrait", "cite", "foret", "lys"]],
  ["silhouette", ["silhouette", "robe", "talons", "legs", "body"]],
  ["portrait", ["portrait", "cheveux", "femme", "tete", "regard", "visage"]],
];

const deburr = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Paintings carry no category column, so the gallery filters derive one from the
 * id and title. Anything unrecognised falls into "autre" rather than being
 * forced into a bucket it does not belong to.
 */
export function categoryOf(painting: Painting): Category {
  const haystack = deburr(`${painting.id} ${painting.title}`);
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => haystack.includes(k))) return category;
  }
  return "autre";
}

/**
 * The series a work belongs to: the stored collection when the admin has set
 * one, otherwise the derived group so nothing ever shows blank.
 */
export function collectionOf(painting: Painting, lang: Lang = "fr"): string {
  const stored = painting.collection?.trim();
  if (stored) return stored;
  return CATEGORY_LABELS[categoryOf(painting)][lang];
}

export const CATEGORY_LABELS: Record<Category, Record<Lang, string>> = {
  portrait: { fr: "Portraits", en: "Portraits" },
  silhouette: { fr: "Silhouettes", en: "Silhouettes" },
  danse: { fr: "Danse", en: "Dance" },
  abstrait: { fr: "Abstrait", en: "Abstract" },
  autre: { fr: "Autres", en: "Other" },
};

const NARROW_NBSP = "\u202f";

/** 1850 -> "1 850 $" with the Québec narrow no-break thousands separator. */
export function formatPrice(price: number | null, lang: Lang): string {
  if (price === null || Number.isNaN(price)) return lang === "en" ? "Price on request" : "Prix sur demande";
  const grouped = Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP);
  return `${grouped}${NARROW_NBSP}$`;
}

/** What a work's price line reads as, accounting for sold works. */
export function priceLabel(painting: Painting, lang: Lang): string {
  if (painting.sold) return lang === "en" ? "Sold" : "Vendu";
  return formatPrice(painting.price, lang);
}

/** "2021 · Acrylique sur toile · 36" × 24"" */
export function metaLine(painting: Painting): string {
  return [painting.year, painting.medium, painting.dimensions].filter(Boolean).join(" · ");
}

/** Total catalogue value of the works still available, in thousands. */
export function catalogueValue(paintings: Painting[]): number {
  return paintings.reduce((sum, p) => (p.sold ? sum : sum + (p.price ?? 0)), 0);
}

/** next/image cannot optimise the Vercel Blob URLs the admin uploads. */
export function isRemoteImage(src: string): boolean {
  return src.startsWith("http");
}
