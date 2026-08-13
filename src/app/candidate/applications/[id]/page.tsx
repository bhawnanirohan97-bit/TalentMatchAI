"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, MessageSquareText } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApplication, withdrawApplication } from "@/lib/api/candidates";
import { MatchExplanation } from "@/components/jobs/match-explanation";
import { CompanyLogo } from "@/components/shared/company-logo";
import { StageBadge } from "@/components/shared/stage-badge";
import { MatchRing } from "@/components/shared/match-ring";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { APPLICATION_STATUS } from "@/domain/enums";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const id = params.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id),
    enabled: Boolean(id),
  });

  const withdraw = useMutation({
    mutationFn: () => withdrawApplication(id),
    onSuccess: () => {
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["application", id] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not withdraw"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { application, stageHistory, matchBreakdown, job } = data;
  const canWithdraw =
    application.status !== APPLICATION_STATUS.HIRED &&
    application.status !== APPLICATION_STATUS.REJECTED &&
    application.status !== APPLICATION_STATUS.WITHDRAWN;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/candidate/applications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> All applications
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <CompanyLogo name={application.companyName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">{application.jobTitle}</h1>
              <StageBadge status={application.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {application.companyName} · Applied {formatDate(application.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MatchRing score={application.matchScore} size={64} stroke={6} />
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs text-muted-foreground">Match</span>
              {canWithdraw && (
                <Button variant="outline" size="sm" onClick={() => withdraw.mutate()} disabled={withdraw.isPending}>
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stage timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l border-border pl-5">
              {stageHistory.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[27px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge status={event.to} />
                    <span className="text-xs text-muted-foreground">{formatDate(event.createdAt)} · by {event.actorName}</span>
                  </div>
                  {event.note && <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-muted-foreground" aria-hidden /> Cover letter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {application.coverLetter || "No cover letter provided."}
              </p>
              <Separator className="my-4" />
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" aria-hidden /> {application.resumeFileName}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Score {matchBreakdown.score} · {matchBreakdown.criteria.length} criteria · model {matchBreakdown.generatedByModel}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <MatchExplanation job={job} />

      <Button asChild variant="outline">
        <Link href={`/jobs/${job.slug}`}>View job listing</Link>
      </Button>
    </div>
  );
}
