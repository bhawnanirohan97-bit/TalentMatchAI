import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatsBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-border lg:grid-cols-4", className)}>
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
    <div className={cn("flex flex-col bg-card px-4 py-3.5 sm:px-5", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="group transition-colors hover:bg-muted/50 focus-visible:outline-none">
      {inner}
    </Link>
  );
}
