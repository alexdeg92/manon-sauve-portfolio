"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger, in steps of 50ms, matching the design's index-based delay. */
  index?: number;
  className?: string;
}

/**
 * Fades and lifts a block into place the first time it enters the viewport.
 * The design does this with one IntersectionObserver over every [data-r] node;
 * here each block observes itself and then stops.
 */
export default function Reveal({ children, index = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect a reduced-motion preference by showing everything immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(el);

    // Failsafe: never leave content invisible if the observer never fires
    // (print, headless capture, an unusual scroll container).
    const failsafe = setTimeout(() => setShown(true), 4000);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(24px)",
        transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${index * 0.05}s, transform .7s cubic-bezier(.16,1,.3,1) ${index * 0.05}s`,
      }}
    >
      {children}
    </div>
  );
}
