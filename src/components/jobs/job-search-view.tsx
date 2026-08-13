"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Loader2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { listJobs, getJobSkillSuggestions } from "@/lib/api/jobs";
import type { JobSearchParams } from "@/domain/types";
import { EMPLOYMENT_TYPE, EXPERIENCE_LEVEL, WORK_MODE } from "@/domain/enums";
import { SORT_OPTIONS } from "@/domain/constants";
import { JobCard } from "@/components/shared/job-card";
import { JobCardSkeleton } from "@/components/shared/job-card-skeleton";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { pluralize } from "@/lib/utils";

type SearchParamsInput = Record<string, string | string[] | undefined>;

function parseParams(params: SearchParamsInput): JobSearchParams {
  const arr = (v: string | string[] | undefined) =>
    v ? (Array.isArray(v) ? v : [v]) : undefined;
  return {
    q: typeof params.q === "string" ? params.q : undefined,
    location: typeof params.location === "string" ? params.location : undefined,
    skills: arr(params.skills),
    salaryMin: params.salary ? Number(params.salary) : undefined,
    employmentTypes: arr(params.employmentType) as JobSearchParams["employmentTypes"],
    workModes: arr(params.workMode) as JobSearchParams["workModes"],
    experienceLevels: arr(params.experience) as JobSearchParams["experienceLevels"],
    industries: arr(params.industry),
    postedWithinDays: params.posted ? Number(params.posted) : undefined,
    page: params.page ? Number(params.page) : 1,
    sort: (params.sort as JobSearchParams["sort"]) ?? "relevance",
  };
}

function toUrlParams(params: JobSearchParams): SearchParamsInput {
  const p: SearchParamsInput = {};
  if (params.q) p.q = params.q;
  if (params.location) p.location = params.location;
  if (params.skills?.length) p.skills = params.skills;
  if (params.salaryMin) p.salary = String(params.salaryMin);
  if (params.employmentTypes?.length) p.employmentType = params.employmentTypes;
  if (params.workModes?.length) p.workMode = params.workModes;
  if (params.experienceLevels?.length) p.experience = params.experienceLevels;
  if (params.industries?.length) p.industry = params.industries;
  if (params.postedWithinDays) p.posted = String(params.postedWithinDays);
  if (params.page && params.page > 1) p.page = String(params.page);
  if (params.sort && params.sort !== "relevance") p.sort = params.sort;
  return p;
}

const experienceOptions = Object.values(EXPERIENCE_LEVEL);
const employmentOptions = Object.values(EMPLOYMENT_TYPE);
const workModeOptions = Object.values(WORK_MODE);
const salaryOptions = [50000, 65000, 80000, 95000, 120000];
const postedOptions = [
  { value: 1, label: "Past 24 hours" },
  { value: 7, label: "Past week" },
  { value: 14, label: "Past 14 days" },
  { value: 30, label: "Past 30 days" },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={selected.includes(option)} onCheckedChange={() => onToggle(option)} aria-label={option} />
          <span className={selected.includes(option) ? "font-medium" : ""}>{option}</span>
        </label>
      ))}
    </div>
  );
}

export function JobSearchView({ initialParams }: { initialParams: SearchParamsInput }) {
  const router = useRouter();
  const [params, setParams] = useState<JobSearchParams>(() => parseParams(initialParams));
  const [skillInput, setSkillInput] = useState("");

  const { data: skillSuggestions = [] } = useQuery({
    queryKey: ["skill-suggestions"],
    queryFn: getJobSkillSuggestions,
    staleTime: Infinity,
  });

  const query = useQuery({
    queryKey: ["jobs", params],
    queryFn: () => listJobs(params),
    placeholderData: (prev) => prev,
  });

  const syncUrl = useCallback(
    (next: JobSearchParams) => {
      const p = toUrlParams(next);
      const qs = new URLSearchParams();
      Object.entries(p).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
        else if (value !== undefined) qs.set(key, value);
      });
      const q = qs.toString();
      router.replace(q ? `/jobs?${q}` : "/jobs", { scroll: false });
    },
    [router],
  );

  const update = useCallback(
    (patch: Partial<JobSearchParams>, resetPage = true) => {
      setParams((prev) => {
        const next = { ...prev, ...patch, page: resetPage ? 1 : patch.page ?? prev.page };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const toggleIn = useCallback(
    (key: "skills" | "employmentTypes" | "workModes" | "experienceLevels" | "industries", value: string) => {
      setParams((prev) => {
        const current = (prev[key] as string[]) ?? [];
        const next = { ...prev, page: 1, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s) return;
    setSkillInput("");
    toggleIn("skills", s);
  };

  const clearAll = () => {
    setParams({ page: 1, sort: "relevance" });
    syncUrl({ page: 1, sort: "relevance" });
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (params.q) n++;
    if (params.location) n++;
    if (params.skills?.length) n += params.skills.length;
    if (params.salaryMin) n++;
    if (params.employmentTypes?.length) n += params.employmentTypes.length;
    if (params.workModes?.length) n += params.workModes.length;
    if (params.experienceLevels?.length) n += params.experienceLevels.length;
    if (params.industries?.length) n += params.industries.length;
    if (params.postedWithinDays) n++;
    return n;
  }, [params]);

  const result = query.data;
  const keyword = params.q?.trim();

  const filters = (
    <div className="space-y-6">
      <FilterSection title="Keywords">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={params.q ?? ""}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Title, skill, company…"
            className="pl-8"
            aria-label="Search keywords"
          />
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={params.location ?? ""}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="City, state, or Remote"
            className="pl-8"
            aria-label="Location"
          />
        </div>
      </FilterSection>

      <FilterSection title="Skills">
        <div className="flex flex-wrap gap-1.5">
          {(params.skills ?? []).map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
              {s}
              <button
                type="button"
                onClick={() => toggleIn("skills", s)}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remove ${s} skill`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder="Add a skill (press Enter)"
            aria-label="Add skill"
            list="skill-suggestions"
          />
          <datalist id="skill-suggestions">
            {skillSuggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
          <Button type="button" variant="outline" size="sm" onClick={() => addSkill(skillInput)}>Add</Button>
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Employment type">
        <CheckboxGroup options={employmentOptions} selected={params.employmentTypes ?? []} onToggle={(v) => toggleIn("employmentTypes", v)} />
      </FilterSection>

      <FilterSection title="Work mode">
        <CheckboxGroup options={workModeOptions} selected={params.workModes ?? []} onToggle={(v) => toggleIn("workModes", v)} />
      </FilterSection>

      <FilterSection title="Experience level">
        <CheckboxGroup options={experienceOptions} selected={params.experienceLevels ?? []} onToggle={(v) => toggleIn("experienceLevels", v)} />
      </FilterSection>

      <FilterSection title="Posted within">
        <div className="flex flex-wrap gap-1.5">
          {postedOptions.map((o) => (
            <Badge
              key={o.value}
              variant={params.postedWithinDays === o.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => update({ postedWithinDays: params.postedWithinDays === o.value ? undefined : o.value })}
            >
              {o.label}
            </Badge>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Minimum salary">
        <div className="flex flex-wrap gap-1.5">
          {salaryOptions.map((s) => (
            <Badge
              key={s}
              variant={params.salaryMin === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => update({ salaryMin: params.salaryMin === s ? undefined : s })}
            >
              ${s / 1000}k+
            </Badge>
          ))}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={clearAll}>
          Clear all filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Find your next role"
        description={
          <>
            {result ? pluralize(result.total, "job", "jobs") : "Searching"}
            {keyword && <> matching <span className="font-medium text-foreground">“{keyword}”</span></>}
          </>
        }
      >
        <Select value={params.sort} onValueChange={(v) => update({ sort: v as JobSearchParams["sort"] })}>
          <SelectTrigger className="w-[180px]" aria-label="Sort results">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border bg-card p-5">
            {filters}
          </div>
        </aside>

        {/* Mobile filters */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="mr-2 size-4" aria-hidden />
                Filters
                {activeFilterCount > 0 && <Badge className="ml-2">{activeFilterCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 pb-8">{filters}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="min-w-0">
          {query.isPending && !query.isPlaceholderData ? (
            <div className="divide-y rounded-lg border bg-card">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : query.isError ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                icon="alert"
                title="We couldn't load jobs"
                description="Something went wrong while searching. Please try again."
              />
            </div>
          ) : result && result.jobs.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                icon="search"
                title="No jobs match your filters"
                description="Try broadening your search — remove a filter, change the keyword, or look at a different location."
                action={
                  <Button variant="outline" onClick={clearAll}>Clear all filters</Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y rounded-lg border bg-card">
                {result?.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {result && result.totalPages > 1 && (
                <Pagination className="pt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if ((result.page ?? 1) > 1) update({ page: (result.page ?? 1) - 1 }, false);
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: result.totalPages }).slice(0, 5).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={result.page === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            update({ page: i + 1 }, false);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if ((result.page ?? 1) < result.totalPages) update({ page: (result.page ?? 1) + 1 }, false);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
              {query.isFetching && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Updating results…
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
