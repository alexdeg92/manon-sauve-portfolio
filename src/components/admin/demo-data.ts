/**
 * Placeholder figures for the admin panels that have no data source yet:
 * site traffic, per-work view counts and visitor provenance.
 *
 * Every other number in the portal is computed from the real catalogue.
 * Delete a block once the matching API exists.
 */

/** Visits per day over the last 14 days. */
export const TRAFFIC = [38, 44, 41, 62, 55, 71, 66, 58, 74, 88, 79, 96, 84, 92];

export const ANALYTICS_CARDS = [
  { label: "Visites, 30 jours", value: "2 148", delta: "+12 % vs mois précédent" },
  { label: "Pages par visite", value: "4,6", delta: "+0,3" },
  { label: "Demandes", value: "5", delta: "+2" },
  { label: "Taux de demande", value: "2,1 %", delta: "+0,4 pt" },
];

export const SOURCES = [
  { label: "Recherche Google", pct: 46 },
  { label: "Instagram", pct: 28 },
  { label: "Lien direct", pct: 17 },
  { label: "Infolettre", pct: 9 },
];

/**
 * View counts keyed by painting id. Anything missing falls back to 0, so this
 * survives the catalogue changing underneath it.
 */
export const VIEWS: Record<string, number> = {
  "portrait-rose": 412,
  flamenco: 388,
  "cheveux-roux": 341,
  "robe-rouge": 297,
  "abstrait-feu": 264,
  "pointes-ballet": 233,
  "cite-bleue": 210,
  "femme-ocre": 188,
  "robe-bleue": 166,
  "silhouette-nb": 154,
  "talons-nb": 121,
  "abstrait-bleu": 98,
  "portrait-nb": 86,
  "portrait-boucle": 74,
  "portrait-rose2": 61,
};

export const viewsFor = (id: string): number => VIEWS[id] ?? 0;
