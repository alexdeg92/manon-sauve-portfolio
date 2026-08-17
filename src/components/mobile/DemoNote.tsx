"use client";

import { useSite } from "@/components/site/context";

/**
 * Marks a panel whose content is placeholder because no API backs it yet.
 * Remove the tag along with the demo data once the endpoint exists.
 */
export default function DemoNote({ className = "" }: { className?: string }) {
  const { t } = useSite();
  return (
    <div
      className={`rounded-[12px] border border-dashed border-m-line-strong bg-m-sand-soft px-3.5 py-2.5 text-[11px] leading-[1.5] text-m-stone ${className}`}
    >
      {t(
        "Contenu de démonstration — cette section n'est pas encore reliée à des données réelles.",
        "Demo content — this section is not connected to real data yet."
      )}
    </div>
  );
}
