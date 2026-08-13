import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Eye,
  HeartHandshake,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { HeroSearch } from "@/components/shared/hero-search";
import { JobCard } from "@/components/shared/job-card";
import { CompanyLogo } from "@/components/shared/company-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listJobs } from "@/lib/api/jobs";
import { COMPANIES } from "@/lib/mock/companies";

const stats = [
  { value: "180+", label: "Active job listings" },
  { value: "120+", label: "Companies hiring" },
  { value: "1.2k", label: "Applications tracked" },
  { value: "92%", label: "Match accuracy on demo data" },
];

const steps = [
  {
    icon: Users,
    title: "Create your profile",
    text: "Headline, skills, experience, and preferences. Your data stays yours — with privacy controls and export.",
  },
  {
    icon: Sparkles,
    title: "Discover with explainable matching",
    text: "Search and get ranked recommendations with clear matched, missing, and uncertain criteria — never an opaque label.",
  },
  {
    icon: Eye,
    title: "Apply and track",
    text: "Apply with one resume and watch your application move through a transparent pipeline with stage updates.",
  },
];

const recruiterSteps = [
  {
    icon: Briefcase,
    title: "Publish a job",
    text: "Draft with an AI assistant, review the extracted skills, and publish with confidence.",
  },
  {
    icon: Layers,
    title: "Review structured candidates",
    text: "See parsed resumes, skills, and match explanations side by side with private notes.",
  },
  {
    icon: BarChart3,
    title: "Measure the funnel",
    text: "Move applicants through your pipeline and watch conversion, response time, and time-in-stage.",
  },
];

const aiFeatures = [
  {
    icon: Bot,
    title: "Resume parsing",
    text: "PDF/DOCX resumes become structured skills, roles, and education you can review and correct.",
  },
  {
    icon: Target,
    title: "Explainable match scores",
    text: "Every score shows the matched, missing, and uncertain criteria that produced it.",
  },
  {
    icon: HeartHandshake,
    title: "Human-in-the-loop",
    text: "AI assists but never decides. Recruiters own every stage change and every outcome.",
  },
];

export default async function HomePage() {
  const featured = await listJobs({ pageSize: 4, sort: "recent" });

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/40 via-background to-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary)/0.08,transparent)]" aria-hidden />
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
            <Badge variant="outline" className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Explainable AI matching, built for transparent hiring
            </Badge>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Find jobs that <span className="text-primary">fit you</span> — and hire people who{" "}
              <span className="text-primary">fit your team</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              TalentMatch AI connects job seekers and employers through discoverable listings, structured
              applications, recruiter pipelines, and explainable AI assistance.
            </p>
            <div className="mt-8 flex justify-center">
              <HeroSearch />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-emerald-500" aria-hidden /> Verified employers</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-500" aria-hidden /> Privacy-first profiles</span>
              <span className="inline-flex items-center gap-1.5"><Target className="size-4 text-emerald-500" aria-hidden /> Evidence-based matches</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold tracking-tight text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured jobs */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured opportunities</h2>
              <p className="mt-2 text-muted-foreground">Fresh entry-level roles in technology, remote-first and beyond.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/jobs">
                View all jobs <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* How it works — candidate */}
        <section id="how-it-works" className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">For job seekers</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">From discovery to decision</h2>
              <p className="mt-3 text-muted-foreground">
                A coherent flow from profile to application — with visibility at every step.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="rounded-lg border bg-background p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-4xl font-semibold text-muted-foreground/20">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI explainability */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">Explainable AI</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Scores with receipts — not black boxes.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Every match score, recommendation, and extraction is assistive, inspectable, and correctable.
                AI never makes final hiring decisions.
              </p>
              <ul className="mt-8 space-y-4">
                {aiFeatures.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                      <f.icon className="size-4.5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link href="/login">See the match experience <ArrowRight className="ml-2 size-4" aria-hidden /></Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">Frontend Developer (React)</p>
                  <p className="text-sm text-muted-foreground">NovaTech · Remote · Full-time</p>
                </div>
                <div className="flex size-16 items-center justify-center rounded-full border-4 border-emerald-500 text-emerald-600 dark:text-emerald-400">
                  <span className="text-lg font-semibold">92</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "React", state: "Matched", dot: "bg-emerald-500", note: "Found on your profile" },
                  { label: "TypeScript", state: "Matched", dot: "bg-emerald-500", note: "Found on your profile" },
                  { label: "Tailwind CSS", state: "Matched", dot: "bg-emerald-500", note: "Found on your resume" },
                  { label: "Testing", state: "Missing", dot: "bg-rose-500", note: "Preferred — add if you have it" },
                  { label: "Remote work", state: "Matched", dot: "bg-emerald-500", note: "You're open to remote" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${c.dot}`} aria-hidden />
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{c.state}</span>
                      <p className="text-xs text-muted-foreground">{c.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Generated by <code className="rounded bg-muted px-1">deterministic-v1</code> · reproducible for the same inputs
              </p>
            </div>
          </div>
        </section>

        {/* Recruiter */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">For recruiters & hiring managers</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your applicant tracking, without the chaos</h2>
              <p className="mt-3 text-muted-foreground">
                Structured candidates, a configurable pipeline, and funnel analytics in one place.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {recruiterSteps.map((step) => (
                <div key={step.title} className="rounded-lg border bg-background p-6">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Companies */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Companies hiring now</h2>
              <p className="mt-2 text-muted-foreground">Browse verified employers across technology and beyond.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/companies">
                All companies <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANIES.slice(0, 8).map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="group rounded-lg border bg-background p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <CompanyLogo name={company.name} size="md" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate font-semibold">
                      {company.name}
                      {company.verified && <BadgeCheck className="size-4 shrink-0 text-emerald-500" aria-hidden />}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{company.description}</p>
                <p className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {company.jobCount} open role{company.jobCount === 1 ? "" : "s"} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-md border bg-gradient-to-br from-primary to-indigo-700 p-10 text-center text-primary-foreground sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" aria-hidden />
            <div className="relative">
              <Building2 className="mx-auto size-10" aria-hidden />
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
                Ready to build a hiring flow that shows your work?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
                Explore the candidate and recruiter experiences with seeded demo accounts. No sign-up friction — just choose a role.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">Enter the demo</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                  <Link href="/jobs">Browse jobs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
