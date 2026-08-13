import { cn } from "@/lib/utils";

export function matchTone(score: number) {
  if (score >= 80)
    return "text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-900 dark:bg-emerald-950/50";
  if (score >= 60)
    return "text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-300 dark:border-amber-900 dark:bg-amber-950/50";
  return "text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-300 dark:border-rose-900 dark:bg-rose-950/50";
}

export function matchDot(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function MatchIndicator({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-semibold", matchTone(score), className)}
    >
      <span className={cn("size-1.5 rounded-full", matchDot(score))} aria-hidden />
      {score}% match
    </span>
  );
}
