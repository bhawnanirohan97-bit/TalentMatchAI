import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, CalendarDays, Globe, MapPin } from "lucide-react";
import { COMPANIES } from "@/lib/mock/companies";
import { JOBS } from "@/lib/mock/jobs";
import { CompanyLogo } from "@/components/shared/company-logo";
import { JobCard } from "@/components/shared/job-card";
import { FollowCompanyButton } from "@/components/companies/follow-company-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JOB_STATUS } from "@/domain/enums";

export async function generateMetadata({ params }: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = COMPANIES.find((c) => c.slug === slug);
  return { title: company ? company.name : "Company not found", description: company?.description };
}

export default async function CompanyDetailPage({ params }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = COMPANIES.find((c) => c.slug === slug);
  if (!company) notFound();

  const openJobs = JOBS.filter((j) => j.companyId === company.id && j.status === JOB_STATUS.ACTIVE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground">← All companies</Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-muted/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <CompanyLogo name={company.name} size="lg" className="size-20 text-xl" />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {company.name}
              {company.verified && <BadgeCheck className="size-5 text-emerald-500" aria-label="Verified employer" />}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" aria-hidden />{company.industry}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{company.locations.join(", ")}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden />Founded {company.foundedYear}</span>
              <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Globe className="size-3.5" aria-hidden />{company.website.replace("https://", "")}
              </a>
            </div>
          </div>
        </div>
        <FollowCompanyButton companyId={company.id} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="text-lg font-semibold">About us</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{company.description}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Culture</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{company.culture}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Open positions ({openJobs.length})</h2>
            {openJobs.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No open roles right now — follow this company to be notified when new jobs are posted.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {openJobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="text-sm font-semibold">Company snapshot</h3>
            <Separator className="my-4" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Industry</dt><dd className="font-medium">{company.industry}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Size</dt><dd className="font-medium">{company.sizeRange} employees</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Founded</dt><dd className="font-medium">{company.foundedYear}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Open roles</dt><dd className="font-medium">{openJobs.length}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Verification</dt><dd>
                {company.verified ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
              </dd></div>
            </dl>
            <Separator className="my-4" />
            <h3 className="text-sm font-semibold">Benefits</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {company.benefits.map((b) => <li key={b} className="flex gap-2"><span className="text-emerald-500" aria-hidden>✓</span>{b}</li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
