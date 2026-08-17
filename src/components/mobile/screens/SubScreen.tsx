"use client";

import { useSite } from "@/components/site/context";

/** Shared header for the screens nested under Gestion, with a back affordance. */
export default function SubScreen({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const { t } = useSite();
  return (
    <div className="animate-mFade">
      <div className="px-6 pt-3.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-m-stone"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 5-7 7 7 7" />
          </svg>
          {t("Gestion", "Manage")}
        </button>
        <h1 className="m-0 mt-3 text-[32px] font-normal tracking-[-.03em]">{title}</h1>
      </div>
      {children}
    </div>
  );
}
