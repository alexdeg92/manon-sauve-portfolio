/**
 * Exhibition and press history. There is no table for this yet, so the list is
 * hard-coded here rather than fetched. Replace with a real source when one
 * exists; the section reads nothing else.
 */

export interface Exhibition {
  year: string;
  title: string;
  venue: { fr: string; en: string };
  kind: { fr: string; en: string };
}

export const EXHIBITIONS: Exhibition[] = [
  {
    year: "2025",
    title: "Figures rapprochées",
    venue: { fr: "Galerie Beaux-Arts, Montréal", en: "Galerie Beaux-Arts, Montréal" },
    kind: { fr: "Exposition solo", en: "Solo show" },
  },
  {
    year: "2024",
    title: "Corps et mouvement",
    venue: { fr: "Maison de la culture, Laval", en: "Maison de la culture, Laval" },
    kind: { fr: "Collectif", en: "Group show" },
  },
  {
    year: "2022",
    title: "Symposium de peinture",
    venue: { fr: "Baie-Saint-Paul · artiste invitée", en: "Baie-Saint-Paul · invited artist" },
    kind: { fr: "Symposium", en: "Symposium" },
  },
  {
    year: "2019",
    title: "Prix du jury",
    venue: { fr: "Salon des artistes, Sherbrooke", en: "Salon des artistes, Sherbrooke" },
    kind: { fr: "Distinction", en: "Award" },
  },
];
