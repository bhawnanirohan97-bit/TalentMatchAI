"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveJobs, listApplicants, listInterviews } from "@/lib/api/recruiter";
import { StageBadge } from "@/components/shared/stage-badge";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatsBar, StatItem } from "@/components/shared/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { formatDate, timeAgo } from "@/lib/utils";
import { APPLICATION_STATUS, INTERVIEW_STATUS } from "@/domain/enums";
import { STAGE_META, PIPELINE_STAGES } from "@/domain/constants";

export default function RecruiterDashboardPage() {
  const { data: jobs } = useQuery({ queryKey: ["recruiter-jobs"], queryFn: () => getActiveJobs() });
  const { data: applicants, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-applicants"],
    queryFn: () => listApplicants({ page: 1, pageSize: 100 }),
  });
  const { data: interviews } = useQuery({ queryKey: ["recruiter-interviews"], queryFn: () => listInterviews() });

  const apps = applicants?.items ?? [];
  const upcoming = (interviews ?? []).filter((i) => i.status === INTERVIEW_STATUS.SCHEDULED);
  const total = apps.length;
  const interviewsCount = apps.filter((a) => a.status === APPLICATION_STATUS.INTERVIEW).length;
  const offers = apps.filter((a) => a.status === APPLICATION_STATUS.OFFER).length;
  const hired = apps.filter((a) => a.status === APPLICATION_STATUS.HIRED).length;

  return (
    <div className="space-y-8">
      <PageHeader title="Recruiting dashboard" description="NovaTech · Hiring pipeline at a glance.">
        <Button asChild>
          <Link href="/recruiter/jobs"><Plus className="mr-2 size-4" aria-hidden /> New job</Link>
        </Button>
      </PageHeader>

      <StatsBar>
        <StatItem label="Open jobs" value={jobs?.length ?? 0} href="/recruiter/jobs" />
        <StatItem label="Total applicants" value={total} href="/recruiter/candidates" />
        <StatItem label="In interviews" value={interviewsCount} href="/recruiter/candidates" />
        <StatItem label="Offers / hired" value={`${offers} / ${hired}`} href="/recruiter/candidates" />
      </StatsBar>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5 pb-4">
              <SectionHeader title="Pipeline by stage" description="Where candidates are right now" />
              <Button variant="outline" size="sm" asChild>
                <Link href="/recruiter/candidates">View candidates</Link>
              </Button>
            </div>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
                </div>
              ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {PIPELINE_STAGES.concat([APPLICATION_STATUS.REJECTED]).map((stage) => {
                    const count = apps.filter((a) => a.status === stage).length;
                    return (
                      <div key={stage} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <span className={`size-2.5 rounded-full ${STAGE_META[stage].dot}`} aria-hidden />
                          <span className="text-sm font-medium">{STAGE_META[stage].label}</span>
                        </div>
                        <span className="text-lg font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="border-b p-5 pb-4">
              <SectionHeader title="Recent applicants" description="Newest activity in the pipeline" />
            </div>
            <CardContent>
              {apps.length === 0 ? (
                <EmptyState compact icon="inbox" title="No applicants yet" />
              ) : (
                <ul className="divide-y">
                  {apps.slice(0, 6).map((app) => (
                    <li key={app.id} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/recruiter/candidates/${app.id}`} className="group flex items-center gap-3">
                        <MatchIndicator score={app.matchScore} className="hidden sm:inline-flex" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-primary">{app.candidateName}</p>
                          <p className="truncate text-xs text-muted-foreground">{app.jobTitle} · applied {timeAgo(app.createdAt)}</p>
                        </div>
                        <StageBadge status={app.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5 pb-4">
              <SectionHeader title="Upcoming interviews" description="Next on the calendar" />
              <Button variant="outline" size="sm" asChild>
                <Link href="/recruiter/interviews">Schedule</Link>
              </Button>
            </div>
            <CardContent>
              {upcoming.length === 0 ? (
                <EmptyState compact icon="inbox" title="Nothing scheduled" />
              ) : (
                <ul className="space-y-3">
                  {upcoming.slice(0, 4).map((interview) => (
                    <li key={interview.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium">{interview.candidateName}</p>
                        <span className="text-xs font-medium text-primary">{formatDate(interview.scheduledAt)}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {interview.jobTitle} · {interview.format} · {interview.durationMin} min
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <div className="border-b p-5 pb-4">
              <SectionHeader title="Open roles" />
            </div>
            <CardContent>
              {!jobs || jobs.length === 0 ? (
                <EmptyState compact icon="inbox" title="No open roles" />
              ) : (
                <ul className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <li key={job.id}>
                      <Link href={`/recruiter/jobs/${job.id}`} className="group flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium group-hover:text-primary">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.applicationsCount} applicants</p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
