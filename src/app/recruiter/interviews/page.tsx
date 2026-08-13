"use client";

import Link from "next/link";
import { CalendarDays, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listInterviews } from "@/lib/api/recruiter";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { INTERVIEW_STATUS } from "@/domain/enums";

export default function InterviewsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-interviews"],
    queryFn: () => listInterviews(),
  });

  const interviews = data ?? [];
  const upcoming = interviews.filter((i) => i.status === INTERVIEW_STATUS.SCHEDULED);
  const completed = interviews.filter((i) => i.status === INTERVIEW_STATUS.COMPLETED);

  return (
    <div className="space-y-6">
      <PageHeader title="Interviews" description="Upcoming and past interviews across all roles." />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <EmptyState compact icon="inbox" title="Nothing scheduled" description="Schedule interviews from a candidate's page." action={<Button asChild variant="outline"><Link href="/recruiter/candidates">Go to candidates</Link></Button>} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((interview) => (
                  <Card key={interview.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{interview.candidateName}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{interview.jobTitle}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 gap-1"><Video className="size-3" aria-hidden /> {interview.format}</Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" aria-hidden />
                        {formatDate(interview.scheduledAt)} · {interview.durationMin} min
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{interview.agenda}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {interview.participants.map((p) => (
                          <Badge key={p} variant="secondary">{p}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {completed.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Completed ({completed.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completed.map((interview) => (
                  <Card key={interview.id} className="opacity-80">
                    <CardContent className="p-5">
                      <p className="font-semibold">{interview.candidateName}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{interview.jobTitle} · {formatDate(interview.scheduledAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
