/**
 * Placeholder content for the artist screens that have no backend yet:
 * the inquiries inbox, analytics and collections.
 *
 * Everything here is invented. Nothing in this file is read by the visitor
 * screens, which use the real catalogue from /api/paintings. Delete a block
 * once the matching API exists.
 */

export type InquiryStatus = "new" | "replied" | "closed";

export interface DemoInquiry {
  id: string;
  status: InquiryStatus;
  name: string;
  email: string;
  kind: { fr: string; en: string };
  subject: { fr: string; en: string };
  message: { fr: string; en: string };
  /** Painting id, resolved against the real catalogue for the thumbnail. */
  paintingId: string;
}

export const DEMO_INQUIRIES: DemoInquiry[] = [
  {
    id: "inq-1",
    status: "new",
    name: "Julie Tremblay",
    email: "julie.tremblay@courriel.ca",
    kind: { fr: "Question sur une œuvre", en: "Question about a work" },
    subject: { fr: "livraison · 17 août", en: "shipping · 17 Aug" },
    message: {
      fr: "Bonjour Manon, est-ce que cette toile peut être expédiée à Québec, et est-elle vendue montée sur châssis ? Merci.",
      en: "Hello Manon, can this canvas be shipped to Québec City, and does it come stretched on a frame? Thank you.",
    },
    paintingId: "flamenco",
  },
  {
    id: "inq-2",
    status: "new",
    name: "Marc Bélanger",
    email: "m.belanger@courriel.ca",
    kind: { fr: "Commande", en: "Commission" },
    subject: { fr: "portrait · 17 août", en: "portrait · 17 Aug" },
    message: {
      fr: "J'aimerais commander un portrait pour le salon, format moyen, budget autour de 400 $. Quel serait le délai ?",
      en: "I would like to commission a portrait for the living room, medium format, budget around $400. What would the timeline be?",
    },
    paintingId: "portrait-rose",
  },
  {
    id: "inq-3",
    status: "replied",
    name: "Sophie Nadeau",
    email: "sophie.n@courriel.ca",
    kind: { fr: "Visite d'atelier", en: "Studio visit" },
    subject: { fr: "sam 23 août", en: "Sat 23 Aug" },
    message: {
      fr: "Bonjour, je confirme ma visite samedi 23 août à 13 h 30. Est-ce qu'il y a du stationnement sur place ?",
      en: "Hello, I confirm my visit on Saturday 23 August at 1:30 pm. Is there parking on site?",
    },
    paintingId: "robe-bleue",
  },
  {
    id: "inq-4",
    status: "replied",
    name: "Galerie Beaux-Arts",
    email: "contact@galeriebeauxarts.ca",
    kind: { fr: "Exposition", en: "Exhibition" },
    subject: { fr: "collectif, printemps 2027 · 11 août", en: "group show, spring 2027 · 11 Aug" },
    message: {
      fr: "Nous préparons une exposition collective sur la figure au printemps 2027 et aimerions vous y inviter avec cinq toiles.",
      en: "We are preparing a group show on the figure for spring 2027 and would like to invite you with five canvases.",
    },
    paintingId: "cite-bleue",
  },
  {
    id: "inq-5",
    status: "closed",
    name: "Antoine Roy",
    email: "a.roy@courriel.ca",
    kind: { fr: "Question sur une œuvre", en: "Question about a work" },
    subject: { fr: "encore disponible ? · 8 août", en: "still available? · 8 Aug" },
    message: {
      fr: "Est-ce que cette pièce est encore disponible ? Sinon, avez-vous quelque chose de semblable en petit format ?",
      en: "Is this piece still available? If not, do you have something similar in a small format?",
    },
    paintingId: "talons-nb",
  },
];

export const DEMO_ANALYTICS = {
  visits: "2 148",
  pagesPerVisit: "4,6",
  inquiries: "5",
  inquiryRate: "2,1 %",
  mostViewed: [
    { paintingId: "portrait-rose", views: 412, weight: 100 },
    { paintingId: "flamenco", views: 388, weight: 94 },
    { paintingId: "cheveux-roux", views: 341, weight: 83 },
    { paintingId: "robe-rouge", views: 297, weight: 72 },
    { paintingId: "abstrait-feu", views: 264, weight: 64 },
  ],
  sources: [
    { label: { fr: "Recherche Google", en: "Google search" }, value: "46 %", weight: 46 },
    { label: { fr: "Instagram", en: "Instagram" }, value: "28 %", weight: 28 },
    { label: { fr: "Lien direct", en: "Direct link" }, value: "17 %", weight: 17 },
    { label: { fr: "Infolettre", en: "Newsletter" }, value: "9 %", weight: 9 },
  ],
};

export const DEMO_COLLECTIONS = [
  { name: "Figures", count: 5 },
  { name: "Mouvement", count: 4 },
  { name: "Abstraits", count: 3 },
];
