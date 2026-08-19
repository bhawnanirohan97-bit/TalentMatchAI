import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/home" className={cn("group inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden />
      </span>
      {!compact && (
        <span className="text-[15px]">
          TalentMatch <span className="text-primary">AI</span>
        </span>
      )}
    </Link>
  );
}
