export default function Footer() {
  return (
    <footer className="bg-warm py-12 border-t border-accent-light/15">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="font-serif text-lg text-charcoal mb-2">Manon Sauvé</p>
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-6">Artiste Peintre — Saint-Joseph-du-Lac, Québec</p>
        <a
          href="https://www.instagram.com/manonsauve_art"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal transition-colors duration-300 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          @manonsauve_art
        </a>
        <div className="separator mb-6" />
        <p className="text-xs text-muted/60">
          © {new Date().getFullYear()} Manon Sauvé. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
