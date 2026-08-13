import { Badge } from "@/components/ui/badge";
import { STAGE_META } from "@/domain/constants";
import type { ApplicationStatus } from "@/domain/enums";

export function StageBadge({ status }: { status: ApplicationStatus }) {
  const meta = STAGE_META[status];
  return (
    <Badge variant="outline" className={meta.badge}>
      <span className={`mr-1.5 inline-block size-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </Badge>
  );
}
