"use client";

import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import { useAuth } from "@/lib/auth/session";
import { useNotifications } from "@/hooks/use-notifications";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { NOTIFICATION_TYPE } from "@/domain/enums";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  [NOTIFICATION_TYPE.APPLICATION]: "Application",
  [NOTIFICATION_TYPE.STAGE]: "Stage update",
  [NOTIFICATION_TYPE.INTERVIEW]: "Interview",
  [NOTIFICATION_TYPE.MESSAGE]: "Message",
  [NOTIFICATION_TYPE.SYSTEM]: "System",
  [NOTIFICATION_TYPE.AI]: "AI",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useNotifications(uid);

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", uid] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread", uid] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(uid),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: ["notifications", uid] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread", uid] });
    },
  });

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description={`${unread} unread · application, interview, and AI updates.`}>
        {unread > 0 && (
          <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            <CheckCheck className="mr-2 size-4" aria-hidden /> Mark all as read
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="inbox" title="All caught up" description="You have no notifications right now." />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-4 p-4 text-left transition-colors hover:bg-muted/40",
                n.read && "opacity-70",
              )}
            >
              <div className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted-foreground/30" : "bg-primary")} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <Badge variant="outline">{TYPE_LABEL[n.type] ?? n.type}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
              {n.link && (
                <span className="shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={n.link}>View</Link>
                  </Button>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
