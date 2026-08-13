"use client";

import { Flag } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listReports, resolveReport } from "@/lib/api/admin";
import { CONTENT_TYPE_LABEL } from "@/lib/api/admin";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { timeAgo } from "@/lib/utils";
import { REPORT_STATUS } from "@/domain/enums";
import { MODERATION_ACTIONS, REPORT_REASON_LABELS } from "@/domain/constants";

const STATUS_BADGE: Record<string, string> = {
  [REPORT_STATUS.OPEN]: "text-rose-600 dark:text-rose-400",
  [REPORT_STATUS.RESOLVING]: "text-amber-600 dark:text-amber-400",
  [REPORT_STATUS.RESOLVED]: "text-emerald-600 dark:text-emerald-400",
  [REPORT_STATUS.DISMISSED]: "text-muted-foreground",
};

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ action: "warn", note: "" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => listReports({ pageSize: 50 }),
  });

  const resolve = useMutation({
    mutationFn: () =>
      resolveReport({ reportId: open!, action: form.action, reasonCode: form.action, note: form.note }),
    onSuccess: () => {
      toast.success("Report resolved");
      setOpen(null);
      setForm({ action: "warn", note: "" });
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not resolve"),
  });

  const reports = data?.items ?? [];
  const openCount = reports.filter((r) => r.status === REPORT_STATUS.OPEN).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Moderation queue" description={`${openCount} open reports awaiting review.`} />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : reports.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="inbox" title="Queue is clear" />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {reports.map((report) => (
            <div key={report.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Flag className="size-4 text-destructive" aria-hidden />
                    <p className="font-semibold">{report.contentTitle}</p>
                    <Badge variant="outline">{CONTENT_TYPE_LABEL[report.contentType]}</Badge>
                    <Badge variant="outline">{REPORT_REASON_LABELS[report.reason] ?? report.reason}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{report.details}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reported by {report.reporterName} · {timeAgo(report.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className={STATUS_BADGE[report.status]}>{report.status}</Badge>
                  {(report.status === REPORT_STATUS.OPEN || report.status === REPORT_STATUS.RESOLVING) && (
                    <Button size="sm" onClick={() => setOpen(report.id)}>Review</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve report</DialogTitle>
            <DialogDescription>Choose an action and add a note for the audit log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODERATION_ACTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mod-note">Note</Label>
              <Textarea id="mod-note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Summary of the decision…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            <Button onClick={() => resolve.mutate()} disabled={resolve.isPending}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
