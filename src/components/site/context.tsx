"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Painting } from "@/data/paintings";
import { Lang } from "@/lib/mobile";

const FAVORITES_KEY = "ms-favoris";

interface SiteContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Mirrors the design's data-en attributes: French first, English second. */
  t: (fr: string, en: string) => string;

  toast: string | null;
  say: (message: string) => void;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (painting: Painting) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside SiteProvider");
  return value;
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Favourites are a per-visitor convenience, so they live in localStorage
  // rather than the database. Read after mount to keep the markup hydratable.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // A blocked or corrupt localStorage just means no saved works.
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // Saving is best effort; the in-memory list still works this session.
    }
  }, []);

  const t = useCallback((fr: string, en: string) => (lang === "en" ? en : fr), [lang]);

  const say = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    (painting: Painting) => {
      const on = favorites.includes(painting.id);
      persist(on ? favorites.filter((id) => id !== painting.id) : [...favorites, painting.id]);
      say(
        lang === "en"
          ? on
            ? "Removed from saved"
            : "Saved"
          : on
            ? "Retiré des favoris"
            : "Ajouté aux favoris"
      );
    },
    [favorites, lang, persist, say]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, toast, say, favorites, isFavorite, toggleFavorite }),
    [lang, t, toast, say, favorites, isFavorite, toggleFavorite]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
