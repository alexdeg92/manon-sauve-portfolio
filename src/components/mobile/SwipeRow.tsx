"use client";

import { useRef, useState } from "react";

const REVEAL = 88;
/** Past this the gesture commits on release; below it the row springs back. */
const COMMIT = 104;
/** Ignore mostly-vertical drags so the list still scrolls normally. */
const DIRECTION_LOCK = 12;

interface SwipeRowProps {
  /** Swipe right to left. */
  onSwipeLeft: () => void;
  leftActionLabel: string;
  /** Swipe left to right. */
  onSwipeRight: () => void;
  rightActionLabel: string;
  destructive?: "left" | "right";
  children: React.ReactNode;
}

/**
 * List row with a reveal-and-commit swipe on both sides.
 *
 * Touch events only: a pointer-based version would fight the list's own
 * scrolling on iOS, and these actions have on-screen equivalents in the detail
 * sheet, so a mouse never needs them.
 */
export default function SwipeRow({
  onSwipeLeft,
  leftActionLabel,
  onSwipeRight,
  rightActionLabel,
  destructive,
  children,
}: SwipeRowProps) {
  const [dx, setDx] = useState(0);
  const [settling, setSettling] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"undecided" | "horizontal" | "vertical">("undecided");

  const reset = () => {
    setSettling(true);
    setDx(0);
    window.setTimeout(() => setSettling(false), 220);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
    axis.current = "undecided";
    setSettling(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - start.current.x;
    const deltaY = touch.clientY - start.current.y;

    if (axis.current === "undecided") {
      if (Math.abs(deltaX) < DIRECTION_LOCK && Math.abs(deltaY) < DIRECTION_LOCK) return;
      axis.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (axis.current === "vertical") return;

    // Resist past the reveal width so the row feels anchored rather than loose.
    const resisted =
      Math.abs(deltaX) > REVEAL
        ? Math.sign(deltaX) * (REVEAL + (Math.abs(deltaX) - REVEAL) * 0.35)
        : deltaX;
    setDx(resisted);
  };

  const onTouchEnd = () => {
    if (axis.current === "horizontal") {
      if (dx <= -COMMIT) onSwipeLeft();
      else if (dx >= COMMIT) onSwipeRight();
    }
    start.current = null;
    axis.current = "undecided";
    reset();
  };

  const showingRight = dx > 0;
  const progress = Math.min(Math.abs(dx) / COMMIT, 1);
  const armed = Math.abs(dx) >= COMMIT;

  const tone = (side: "left" | "right") =>
    destructive === side ? "bg-[#B4534A] text-white" : "bg-m-sage text-m-paper";

  return (
    <div className="relative overflow-hidden rounded-[16px]">
      {/* Action beds sit behind the row and are uncovered by the drag. */}
      <div className="absolute inset-0 flex items-stretch">
        <div
          className={`flex items-center justify-start pl-5 text-[12px] uppercase tracking-[.12em] transition-opacity duration-150 ${tone(
            "right"
          )}`}
          style={{ width: `${Math.max(dx, 0)}px`, opacity: showingRight ? progress : 0 }}
        >
          <span className={armed && showingRight ? "font-medium" : ""}>{rightActionLabel}</span>
        </div>
        <div className="flex-1" />
        <div
          className={`flex items-center justify-end pr-5 text-[12px] uppercase tracking-[.12em] transition-opacity duration-150 ${tone(
            "left"
          )}`}
          style={{ width: `${Math.max(-dx, 0)}px`, opacity: showingRight ? 0 : progress }}
        >
          <span className={armed && !showingRight ? "font-medium" : ""}>{leftActionLabel}</span>
        </div>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{
          transform: `translateX(${dx}px)`,
          transition: settling ? "transform .22s cubic-bezier(.16,1,.3,1)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
