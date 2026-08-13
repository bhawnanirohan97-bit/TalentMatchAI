"use client";

import { Cpu, RotateCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAIJobs, listSystemJobs, retryAIJob } from "@/lib/api/admin";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/utils";
import { AI_JOB_STATUS, AI_JOB_TYPE } from "@/domain/enums";

const TYPE_LABEL: Record<string, string> = {
  [AI_JOB_TYPE.RESUME_PARSING]: "Resume parsing",
  [AI_JOB_TYPE.JOB_SKILL_EXTRACTION]: "Skill extraction",
  [AI_JOB_TYPE.MATCH]: "Match",
  [AI_JOB_TYPE.RECOMMENDATION]: "Recommendations",
  [AI_JOB_TYPE.JD_ASSISTANT]: "JD assistant",
};

const STATUS_BADGE: Record<string, string> = {
  [AI_JOB_STATUS.SUCCEEDED]: "text-emerald-600 dark:text-emerald-400",
  [AI_JOB_STATUS.QUEUED]: "text-muted-foreground",
  [AI_JOB_STATUS.PROCESSING]: "text-sky-600 dark:text-sky-400",
  [AI_JOB_STATUS.FAILED]: "text-rose-600 dark:text-rose-400",
  [AI_JOB_STATUS.DEAD]: "text-amber-600 dark:text-amber-400",
};

import type { AIProcessingJob } from "@/domain/types";

type JobRowItem = AIProcessingJob & { queue?: string };

function JobRow({ job, onRetry, retrying }: { job: JobRowItem; onRetry?: (id: string) => void; retrying?: boolean }) {
  const status = job.status as string;
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{job.label}</p>
            <Badge variant="outline">{job.queue ?? TYPE_LABEL[job.type] ?? job.type}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            input {job.inputRef} {job.outputRef ? `→ ${job.outputRef}` : ""} · {job.modelVersion} · attempts {job.attempts}
          </p>
          <p className="text-xs text-muted-foreground">
            {timeAgo(job.createdAt)} {job.completedAt ? `· completed ${timeAgo(job.completedAt)}` : ""}
          </p>
          {job.error && <p className="mt-1 text-xs text-destructive">{job.error}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE[status]}>{status}</Badge>
          {(status === AI_JOB_STATUS.FAILED || status === AI_JOB_STATUS.DEAD) && onRetry && (
            <Button size="sm" variant="outline" onClick={() => onRetry(job.id)} disabled={retrying}>
              <RotateCw className="mr-1.5 size-3.5" aria-hidden /> Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAIPage() {
  const qc = useQueryClient();

  const { data: aiJobs, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-ai"],
    queryFn: () => listAIJobs(),
  });

  const { data: systemJobs } = useQuery({
    queryKey: ["admin-system-jobs"],
    queryFn: () => listSystemJobs(),
  });

  const retry = useMutation({
    mutationFn: (id: string) => retryAIJob(id),
    onSuccess: () => {
      toast.success("Job requeued");
      qc.invalidateQueries({ queryKey: ["admin-ai"] });
      qc.invalidateQueries({ queryKey: ["admin-system-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Retry failed"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Cpu className="size-5 text-primary" aria-hidden />
            AI processing
          </span>
        }
        description="Resume parsing, matching, and recommendation jobs."
      />

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">AI jobs</TabsTrigger>
          <TabsTrigger value="queues">Queues ({systemJobs?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !aiJobs || aiJobs.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <EmptyState icon="inbox" title="No AI jobs" />
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {aiJobs.map((job) => (
                <JobRow key={job.id} job={job} onRetry={(id) => retry.mutate(id)} retrying={retry.isPending} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queues" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Worker queues</CardTitle>
              <CardDescription>System jobs as dispatched to processing workers.</CardDescription>
            </CardHeader>
            <CardContent>
              {!systemJobs || systemJobs.length === 0 ? (
                <EmptyState compact icon="inbox" title="No queued jobs" />
              ) : (
                <div className="divide-y">
                  {systemJobs.map((job) => <JobRow key={job.id} job={job} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
