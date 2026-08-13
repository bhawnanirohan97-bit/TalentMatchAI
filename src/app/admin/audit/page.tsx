"use client";

import { ScrollText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAuditEvents } from "@/lib/api/admin";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";

export default function AdminAuditPage() {
  const [action, setAction] = useState<string>("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-audit", action],
    queryFn: () => listAuditEvents({ pageSize: 50, action: action === "All" ? undefined : action }),
  });

  const events = data?.items ?? [];
  const actions = Array.from(new Set(events.map((e) => e.action))).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <ScrollText className="size-5 text-primary" aria-hidden />
            Audit log
          </span>
        }
        description="Every sensitive action is recorded for transparency."
      >
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : events.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="inbox" title="No audit events" />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{event.actorName}</p>
                  <Badge variant="outline">{event.action}</Badge>
                  <Badge variant="secondary">{event.entityType}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.entityLabel}</p>
                {event.details && <p className="text-xs text-muted-foreground">{event.details}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.actorRole} · {timeAgo(event.createdAt)} · IP {event.ipAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
