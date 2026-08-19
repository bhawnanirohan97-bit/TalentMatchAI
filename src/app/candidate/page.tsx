"use client";

import Link from "next/link";
import { ArrowRight, Search, Bookmark, ListChecks, Bell, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCandidateProfile, getMyApplications, getRecommendations } from "@/lib/api/candidates";
import { listSavedJobs } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/session";
import { useNotifications } from "@/hooks/use-notifications";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatsBar, StatItem } from "@/components/shared/stats";
import { StageBadge } from "@/components/shared/stage-badge";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/states";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { SkillBadge } from "@/components/shared/badges";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/domain/enums";
import type { ApplicationStatus } from "@/domain/enums";
import { timeAgo, formatSalary } from "@/lib/utils";

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
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${user?.name.split(" ")[0] ?? "there"}`}
        description={profile?.headline ?? "Keep your profile updated to get better matches."}
      >
        <Button asChild size="sm">
          <Link href="/jobs">
            <Search className="size-3.5" aria-hidden />
            Find jobs
          </Link>
        </Button>
      </PageHeader>

      {/* Compact stats */}
      <StatsBar>
        <StatItem
          label="Active apps"
          value={activeApps.length}
          href="/candidate/applications"
        />
        <StatItem
          label="Saved jobs"
          value={savedJobs?.length ?? 0}
          href="/candidate/saved"
        />
        <StatItem
          label="Recommended"
          value={recommendations?.length ?? 0}
          href="/candidate/recommendations"
        />
        <StatItem
          label="Notifications"
          value={unread}
          href="/candidate/notifications"
        />
      </StatsBar>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — recommendations */}
        <section className="min-w-0 lg:col-span-2">
          <SectionHeader
            title="Recommended for you"
            action={
              <Link href="/candidate/recommendations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          {!recommendations || recommendations.length === 0 ? (
            <div className="mt-2 rounded-md border bg-card">
              <EmptyState
                icon="search"
                title="No recommendations yet"
                description="Complete your profile to unlock AI-powered job matches."
                action={<Button asChild size="sm"><Link href="/candidate/profile">Complete profile</Link></Button>}
              />
            </div>
          ) : (
            <div className="mt-2 divide-y rounded-md border bg-card">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.job.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30">
                  <CompanyLogo name={rec.job.companyName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/jobs/${rec.job.slug}`} className="text-sm font-semibold text-foreground hover:text-primary">
                          {rec.job.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{rec.job.companyName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {rec.job.locations.join(", ")} · {rec.job.workMode}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {formatSalary(rec.job.salaryMin, rec.job.salaryMax, rec.job.salaryCurrency)}
                        </p>
                      </div>
                      <MatchIndicator score={rec.matchScore} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rec.job.skillsRequired.slice(0, 4).map((skill) => (
                        <SkillBadge key={skill}>{skill}</SkillBadge>
                      ))}
                      {rec.job.skillsRequired.length > 4 && (
                        <SkillBadge>+{rec.job.skillsRequired.length - 4}</SkillBadge>
                      )}
                    </div>
                    {rec.reason && (
                      <p className="mt-1.5 text-xs text-muted-foreground">{rec.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Profile strength */}
          <div className="rounded-md border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Profile strength</p>
              <Link href="/candidate/profile" className="text-xs font-medium text-primary hover:underline">
                Edit
              </Link>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="text-lg font-semibold">{profileStrength}%</p>
              <p className="text-xs text-muted-foreground">complete</p>
            </div>
            <Progress value={profileStrength} className="mt-2 h-1" />
            <p className="mt-2 text-xs text-muted-foreground">
              Add skills and experience to improve your matches.
            </p>
          </div>

          {/* Quick links */}
          <div className="rounded-md border bg-card p-4">
            <p className="text-sm font-medium">Quick links</p>
            <ul className="mt-3 space-y-1">
              {[
                { label: "My applications", href: "/candidate/applications", icon: ListChecks },
                { label: "Saved jobs", href: "/candidate/saved", icon: Bookmark },
                { label: "Notifications", href: "/candidate/notifications", icon: Bell },
                { label: "Job recommendations", href: "/candidate/recommendations", icon: Sparkles },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Recent applications */}
      <section className="min-w-0">
        <SectionHeader
          title="Recent applications"
          action={
            appItems.length > 0 ? (
              <Link href="/candidate/applications" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : undefined
          }
        />
        {appItems.length === 0 ? (
          <div className="mt-2 rounded-md border bg-card">
            <EmptyState
              icon="inbox"
              title="No applications yet"
              description="You haven't applied to any jobs yet."
              action={<Button asChild size="sm"><Link href="/jobs">Find jobs</Link></Button>}
            />
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-md border bg-card">
            <table className="w-full min-w-[600px] text-sm">
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
                  <tr key={app.id} className="transition-colors hover:bg-muted/30">
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
