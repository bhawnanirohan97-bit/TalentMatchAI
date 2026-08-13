"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { dismissRecommendation, getRecommendations } from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/session";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recommendations", uid],
    queryFn: () => getRecommendations(uid),
    enabled: Boolean(uid),
  });

  const dismiss = useMutation({
    mutationFn: (jobId: string) => dismissRecommendation(jobId),
    onSuccess: () => {
      toast.success("Dismissed from recommendations");
      qc.invalidateQueries({ queryKey: ["recommendations", uid] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden />
            AI recommendations
          </span>
        }
        description="Ranked for you by our explainable matching engine. Every match is scored and justified — nothing is hidden."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <Badge variant="outline">Why this list?</Badge>
        <span className="text-muted-foreground">
          Scores come from your profile (skills, experience, preferences) compared against each job&apos;s requirements.
          Dismiss a job to teach the engine.
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon="inbox"
            title="No recommendations right now"
            description="Complete your profile and we'll surface roles worth your time."
            action={<Button asChild><Link href="/candidate/profile">Complete profile</Link></Button>}
          />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {data.map((rec) => (
            <div key={rec.job.id}>
              <JobCard job={rec.job} matchScore={rec.matchScore} showMatch matchReason={rec.reason} />
              <div className="flex justify-end px-4 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => dismiss.mutate(rec.job.id)}
                  disabled={dismiss.isPending}
                >
                  <X className="mr-1.5 size-3.5" aria-hidden /> Not interested
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
