import type { LucideIcon } from "lucide-react";

/** Section heading: amber icon chip + title, with an optional kicker. */
export default function SectionHeading({
  icon: Icon,
  title,
  kicker,
}: {
  icon: LucideIcon;
  title: string;
  kicker?: string;
}) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/50 bg-accent/10 text-accent">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div>
        {kicker && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{kicker}</p>
        )}
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      </div>
    </div>
  );
}
