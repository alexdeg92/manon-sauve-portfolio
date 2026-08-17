"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Bottom sheet: scrim fades, panel slides up from the bottom edge.
 *
 * Rendered into document.body rather than in place. The screens that open a
 * sheet have `animate-mFade` on their root, and an animated opacity with
 * fill-mode `both` creates a stacking context — which would trap this panel's
 * z-index inside it and let the fixed TabBar (z-50) paint over the sheet's
 * lower half, hiding the reply box. A portal sidesteps the ancestor entirely.
 */
export default function Sheet({ open, onClose, children }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const [canPortal, setCanPortal] = useState(false);

  // document.body only exists on the client, so the portal waits for mount.
  useEffect(() => setCanPortal(true), []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setMounted(false), 450);
    return () => clearTimeout(timer);
  }, [open]);

  // Close on Escape, and stop the page behind the sheet from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted || !canPortal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-m-ink/50 transition-opacity duration-[400ms]"
        style={{ opacity: entered ? 1 : 0 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[26px] bg-m-paper pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-500"
        style={{
          transform: entered ? "none" : "translateY(100%)",
          transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-m-paper pb-1.5 pt-2.5">
          <span className="h-1 w-10 rounded-sm bg-[#DCD7CC]" />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
