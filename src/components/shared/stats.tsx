import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatsBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px rounded-md border bg-border lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function StatItem({
  label,
  value,
  hint,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div className={cn("flex items-baseline gap-x-3 bg-card px-4 py-3 sm:px-5", className)}>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="group transition-colors hover:bg-muted/40 focus-visible:outline-none">
      {inner}
    </Link>
  );
}
