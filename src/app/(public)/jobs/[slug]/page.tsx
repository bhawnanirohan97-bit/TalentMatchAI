import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Clock, MapPin } from "lucide-react";
import { getJobDetailBySlug, getRelatedJobs } from "@/lib/api/jobs";
import { getJobBySlug } from "@/lib/mock/jobs";
import { getCompany } from "@/lib/mock/companies";
import { CompanyLogo } from "@/components/shared/company-logo";
import { JobDetailActions } from "@/components/jobs/job-detail-actions";
import { MatchExplanation } from "@/components/jobs/match-explanation";
import { JobCard } from "@/components/shared/job-card";
import { SkillBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatRelativeDays, formatSalary } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  return {
    title: job.title,
    description: job.summary,
  };
}

export default async function JobDetailPage({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const job = await getJobDetailBySlug(slug);
  if (!job) notFound();
  const company = getCompany(job.companyId);
  const related = await getRelatedJobs(job.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">← Back to search</Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <CompanyLogo name={job.companyName} size="lg" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{job.title}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Link href={`/companies/${job.companyId}`} className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary hover:underline">
                    <Building2 className="size-3.5" aria-hidden /> {job.companyName}
                  </Link>
                  {job.companyVerified && <BadgeCheck className="size-4 text-emerald-500" aria-label="Verified employer" />}
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{job.locations.join(", ")}</span>
                  <span>{job.workMode}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{job.employmentType}</Badge>
                  <Badge variant="secondary">{job.experienceLevel}</Badge>
                  <Badge variant="secondary">{job.industry}</Badge>
                </div>
              </div>
            </div>
            <JobDetailActions job={job} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Salary</p>
              <p className="mt-1 font-semibold">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
              <p className="text-xs text-muted-foreground">{job.salaryCurrency === "INR" ? "per annum" : "per year"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Posted</p>
              <p className="mt-1 font-semibold">{formatDate(job.postedAt)}</p>
              <p className="text-xs text-muted-foreground">{job.applicationsCount} applicants</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</p>
              <p className="mt-1 flex items-center gap-1.5 font-semibold">
                <Clock className="size-4 text-muted-foreground" aria-hidden />
                {formatDate(job.deadline)}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeDays(job.deadline)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-lg font-semibold">About this role</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{job.description}</p>
            </section>

            {job.responsibilities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">What you&apos;ll do</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </section>
            )}

            {job.requirements.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Requirements</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {job.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skillsRequired.map((s) => <SkillBadge key={s}>{s}</SkillBadge>)}
                </div>
              </section>
            )}

            {job.preferredQualifications.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Nice to have</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {job.preferredQualifications.map((q) => <li key={q}>{q}</li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skillsPreferred.map((s) => <SkillBadge key={s}>{s}</SkillBadge>)}
                </div>
              </section>
            )}

            {job.benefits.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Benefits</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {job.benefits.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </section>
            )}

            <Separator />

            <MatchExplanation job={job} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="text-sm font-semibold">About {job.companyName}</h3>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{company?.description}</p>
            <Link
              href={`/companies/${job.companyId}`}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              View company →
            </Link>
            <Separator className="my-5" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Industry</dt><dd className="font-medium">{job.industry}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Company size</dt><dd className="font-medium">{company?.sizeRange}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Founded</dt><dd className="font-medium">{company?.foundedYear}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Contact policy</dt><dd className="text-right font-medium">{company?.contactPolicy}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">Similar roles</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <JobCard key={r.id} job={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
