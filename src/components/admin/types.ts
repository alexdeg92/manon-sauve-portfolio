import { Painting } from "@/data/paintings";

export type AdminView =
  | "bord"
  | "oeuvres"
  | "demandes"
  | "collections"
  | "contenu"
  | "analytique"
  | "medias";

export const VIEW_TITLES: Record<AdminView, [string, string]> = {
  bord: ["Tableau de bord", "Vue d'ensemble de l'atelier"],
  oeuvres: ["Œuvres", "Ajouter, modifier et publier le catalogue"],
  demandes: ["Demandes", "Messages, commandes et visites"],
  collections: ["Collections", "Regrouper les œuvres par série"],
  contenu: ["Contenu du site", "Textes affichés sur le site public"],
  analytique: ["Analytique", "Ce que les visiteurs regardent"],
  medias: ["Médiathèque", "Photos d'œuvres et fichiers"],
};

/** The editable shape of a work, as strings for the form inputs. */
export interface Draft {
  id: string | null;
  title: string;
  medium: string;
  dimensions: string;
  price: string;
  year: string;
  image: string;
  sold: boolean;
}

export function draftFrom(painting: Painting): Draft {
  return {
    id: painting.id,
    title: painting.title,
    medium: painting.medium,
    dimensions: painting.dimensions,
    price: painting.price === null ? "" : String(painting.price),
    year: String(painting.year),
    image: painting.image,
    sold: Boolean(painting.sold),
  };
}

export function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    medium: "Acrylique sur toile",
    dimensions: "",
    price: "",
    year: String(new Date().getFullYear()),
    image: "",
    sold: false,
  };
}
