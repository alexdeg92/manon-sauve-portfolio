import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manon Sauvé — Artiste Peintre",
  description: "Portfolio et galerie d'art de Manon Sauvé, artiste peintre québécoise. Peintures originales à vendre.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
