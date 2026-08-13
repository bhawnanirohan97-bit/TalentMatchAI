import { Button } from "@/components/ui/button";
import { CircleAlert, CircleOff, Inbox, SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { inbox: Inbox, search: SearchX, alert: CircleAlert, off: CircleOff } as const;
type IconName = keyof typeof ICONS;

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const Icon: LucideIcon = ICONS[icon];
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-10" : "py-14", className)}>
      <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-muted/40">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-destructive/10">
        <CircleAlert className="size-4 text-destructive" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
