import { Painting } from "@/data/paintings";

export type AdminView =
  | "bord"
  | "oeuvres"
  | "demandes"
  | "collections"
  | "visites"
  | "expositions"
  | "contenu";

export const VIEW_TITLES: Record<AdminView, [string, string]> = {
  bord: ["Tableau de bord", "Vue d'ensemble de l'atelier"],
  oeuvres: ["Œuvres", "Ajouter, modifier et publier le catalogue"],
  demandes: ["Demandes", "Messages, commandes et visites"],
  collections: ["Collections", "Regrouper les œuvres par série"],
  visites: ["Visites d'atelier", "Jours et heures offerts aux visiteurs"],
  expositions: ["Expositions", "Expositions et presse affichées sur le site"],
  contenu: ["Contenu du site", "Textes affichés sur le site public"],
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
  collection: string;
  note: string;
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
    collection: painting.collection ?? "",
    note: painting.note ?? "",
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
    collection: "",
    note: "",
  };
}
