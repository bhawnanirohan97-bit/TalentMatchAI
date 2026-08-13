"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCandidateProfile, getMyApplications, getRecommendations } from "@/lib/api/candidates";
import { listSavedJobs } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/session";
import { useNotifications } from "@/hooks/use-notifications";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatsBar, StatItem } from "@/components/shared/stats";
import { JobCard } from "@/components/shared/job-card";
import { StageBadge } from "@/components/shared/stage-badge";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/states";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/domain/enums";
import type { ApplicationStatus } from "@/domain/enums";
import { formatDateShort, timeAgo } from "@/lib/utils";

const NEXT_ACTION: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.APPLIED]: "Awaiting review",
  [APPLICATION_STATUS.SCREENING]: "Awaiting recruiter",
  [APPLICATION_STATUS.SHORTLISTED]: "Prepare for interview",
  [APPLICATION_STATUS.INTERVIEW]: "Interview scheduled",
  [APPLICATION_STATUS.OFFER]: "Review offer",
  [APPLICATION_STATUS.HIRED]: "Completed",
  [APPLICATION_STATUS.REJECTED]: "—",
  [APPLICATION_STATUS.WITHDRAWN]: "—",
};

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => getCandidateProfile(uid),
    enabled: Boolean(uid),
  });

  const { data: applications } = useQuery({
    queryKey: ["applications", uid],
    queryFn: () => getMyApplications(uid, 1, 20),
    enabled: Boolean(uid),
  });

  const { data: savedJobs } = useQuery({
    queryKey: ["saved-jobs", uid],
    queryFn: () => listSavedJobs(uid),
    enabled: Boolean(uid),
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", uid],
    queryFn: () => getRecommendations(uid),
    enabled: Boolean(uid),
  });

  const { data: notifications } = useNotifications(uid);
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  const appItems = applications?.items ?? [];
  const activeApps = appItems.filter(
    (a) => a.status !== APPLICATION_STATUS.REJECTED && a.status !== APPLICATION_STATUS.WITHDRAWN,
  );
  const profileStrength = profile?.completed ? 100 : 60;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good morning, ${user?.name.split(" ")[0] ?? "there"}`}
        description={profile?.headline ?? "Keep your profile updated to get better matches."}
      >
        <Button asChild>
          <Link href="/jobs">
            <Search className="size-4" aria-hidden />
            Find jobs
          </Link>
        </Button>
      </PageHeader>

      <StatsBar>
        <StatItem
          label="Active applications"
          value={activeApps.length}
          hint="In review"
          href="/candidate/applications"
        />
        <StatItem label="Saved jobs" value={savedJobs?.length ?? 0} href="/candidate/saved" />
        <StatItem label="Recommended for you" value={recommendations?.length ?? 0} href="/candidate/recommendations" />
        <StatItem label="Unread notifications" value={unread} href="/candidate/notifications" />
      </StatsBar>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="min-w-0 lg:col-span-2">
          <SectionHeader
            title="Recommended for you"
            description="Jobs matched to your profile and preferences"
            action={
              <Link href="/candidate/recommendations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          {!recommendations || recommendations.length === 0 ? (
            <div className="mt-3 rounded-lg border bg-card">
              <EmptyState
                icon="search"
                title="No recommendations yet"
                description="Complete your profile to unlock AI-powered job matches."
                action={<Button asChild size="sm"><Link href="/candidate/profile">Complete profile</Link></Button>}
              />
            </div>
          ) : (
            <div className="mt-3 divide-y rounded-lg border bg-card">
              {recommendations.slice(0, 3).map((rec) => (
                <JobCard key={rec.job.id} job={rec.job} matchScore={rec.matchScore} showMatch matchReason={rec.reason} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <SectionHeader
            title="Profile strength"
            action={
              <Link href="/candidate/profile" className="text-sm font-medium text-primary hover:underline">
                Edit
              </Link>
            }
          />
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">{profileStrength}% complete</p>
              <p className="text-xs text-muted-foreground">Updated {profile ? formatDateShort(profile.updatedAt) : "—"}</p>
            </div>
            <Progress value={profileStrength} className="mt-3 h-1.5" />
            <p className="mt-3 text-sm text-muted-foreground">
              Add your skills and experience to improve job matches.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/candidate/profile">Complete profile</Link>
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-semibold">Getting started</p>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">1</span>
                Upload a resume to speed up applications
              </li>
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">2</span>
                Set preferences so matches stay relevant
              </li>
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">3</span>
                Save jobs you want to come back to
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="min-w-0">
        <SectionHeader
          title="Recent applications"
          description="Latest activity across your applications"
          action={
            appItems.length > 0 ? (
              <Link href="/candidate/applications" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : undefined
          }
        />
        {appItems.length === 0 ? (
          <div className="mt-3 rounded-lg border bg-card">
            <EmptyState
              icon="inbox"
              title="No applications yet"
              description="You haven't applied to any jobs yet."
              action={<Button asChild size="sm"><Link href="/jobs">Find jobs</Link></Button>}
            />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Job</th>
                  <th className="px-4 py-2.5 font-medium">Applied</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Next action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appItems.slice(0, 5).map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link href={`/candidate/applications/${app.id}`} className="flex items-center gap-3">
                        <CompanyLogo name={app.companyName} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground hover:text-primary">{app.jobTitle}</span>
                          <span className="block truncate text-xs text-muted-foreground">{app.companyName}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{timeAgo(app.createdAt)}</td>
                    <td className="px-4 py-3"><StageBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{NEXT_ACTION[app.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
