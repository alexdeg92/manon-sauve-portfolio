export type ScreenName =
  // Visitor
  | "accueil"
  | "galerie"
  | "favoris"
  | "atelier"
  // Artist
  | "bord"
  | "oeuvres"
  | "demandes"
  | "gestion"
  | "collections"
  | "visites"
  | "expositions"
  | "contenu"
  | "medias";

export type Mode = "visiteur" | "artiste";

export const VISITOR_TABS: ScreenName[] = ["accueil", "galerie", "favoris", "atelier"];
export const ARTIST_TABS: ScreenName[] = ["bord", "oeuvres", "demandes", "gestion"];

/** Sub-screens highlight their parent tab, as in the design's data-parent. */
export const PARENT_TAB: Partial<Record<ScreenName, ScreenName>> = {
  collections: "gestion",
  visites: "gestion",
  expositions: "gestion",
  contenu: "gestion",
  medias: "gestion",
};

export const MODE_OF: Record<ScreenName, Mode> = {
  accueil: "visiteur",
  galerie: "visiteur",
  favoris: "visiteur",
  atelier: "visiteur",
  bord: "artiste",
  oeuvres: "artiste",
  demandes: "artiste",
  gestion: "artiste",
  collections: "artiste",
  visites: "artiste",
  expositions: "artiste",
  contenu: "artiste",
  medias: "artiste",
};
