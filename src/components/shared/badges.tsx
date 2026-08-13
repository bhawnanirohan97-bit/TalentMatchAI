import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SkillBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-normal text-foreground/80 bg-secondary/70 hover:bg-secondary", className)}
    >
      {children}
    </Badge>
  );
}

export function StatusBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Badge variant="outline" className={cn("border", className)}>{children}</Badge>;
}
