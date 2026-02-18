export default function Footer() {
  return (
    <footer className="bg-warm py-12 border-t border-accent-light/15">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="font-serif text-lg text-charcoal mb-2">Manon Sauvé</p>
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-6">Artiste Peintre — Joliette, Québec</p>
        <div className="separator mb-6" />
        <p className="text-xs text-muted/60">
          © {new Date().getFullYear()} Manon Sauvé. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
