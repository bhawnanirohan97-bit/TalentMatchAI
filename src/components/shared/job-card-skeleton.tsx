import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4">
      <Skeleton className="size-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3.5 w-36" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-72" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
