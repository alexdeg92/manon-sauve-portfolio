/**
 * Marks a panel whose numbers are placeholder because no API backs them yet.
 * Remove alongside the matching block in demo-data.ts.
 */
export default function DemoTag({
  className = "",
  inline,
  children,
}: {
  className?: string;
  inline?: boolean;
  children?: React.ReactNode;
}) {
  const text = children ?? "Données de démonstration — pas encore reliées à des données réelles.";

  if (inline) {
    return <span className={`text-[11px] text-m-stone-soft ${className}`}>{text}</span>;
  }

  return (
    <div
      className={`rounded-[9px] border border-dashed border-m-line-strong bg-m-sand-soft px-3 py-2 text-[11px] leading-[1.5] text-m-stone ${className}`}
    >
      {text}
    </div>
  );
}
