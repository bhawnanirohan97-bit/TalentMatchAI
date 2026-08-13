import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

const LOGO_TONES = [
  "bg-slate-100 text-slate-700",
  "bg-slate-200 text-slate-700",
  "bg-zinc-100 text-zinc-700",
  "bg-stone-100 text-stone-700",
] as const;

export function CompanyLogo({ name, className, size = "md" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "size-8 text-xs rounded-md",
    md: "size-10 text-sm rounded-md",
    lg: "size-14 text-base rounded-lg",
  } as const;
  const colorIndex = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % LOGO_TONES.length;
  return (
    <Avatar className={cn(sizes[size], "shrink-0", className)}>
      <AvatarFallback className={cn(LOGO_TONES[colorIndex], "font-semibold dark:bg-slate-800 dark:text-slate-200")}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
