"use client";

import { useEffect, useState } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Bottom sheet: scrim fades, panel slides up from the bottom edge. */
export default function Sheet({ open, onClose, children }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

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

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-m-ink/50 transition-opacity duration-[400ms]"
        style={{ opacity: entered ? 1 : 0 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[26px] bg-m-paper transition-transform duration-500"
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
    </div>
  );
}
