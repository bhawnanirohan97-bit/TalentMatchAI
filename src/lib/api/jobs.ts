import { EMPLOYMENT_TYPE, JOB_STATUS, WORK_MODE } from "@/domain/enums";
import type { Job, JobSearchParams, JobSearchResult, SavedJob, SavedSearch } from "@/domain/types";
import { paginate, ok, notFound } from "@/lib/api/client";
import { FOLLOWED_COMPANIES_FOR_DEMO, JOBS, SAVED_JOBS_FOR_DEMO, SAVED_SEARCHES_FOR_DEMO, getJob, getJobBySlug } from "@/lib/mock/jobs";
import { COMPANIES } from "@/lib/mock/companies";

let savedJobs: SavedJob[] = [...SAVED_JOBS_FOR_DEMO];
let followedCompanies: string[] = [...FOLLOWED_COMPANIES_FOR_DEMO];
let savedSearches: SavedSearch[] = [...SAVED_SEARCHES_FOR_DEMO];

const TEXT_FIELDS: (keyof Job)[] = ["title", "summary", "description", "companyName", "industry", "skillsRequired"];

function fuzzyText(job: Job): string {
  return TEXT_FIELDS.map((f) => String(job[f] ?? "")).join(" ").toLowerCase();
}

function matchesText(job: Job, q?: string): boolean {
  if (!q?.trim()) return true;
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = fuzzyText(job);
  return tokens.every((t) => haystack.includes(t));
}

export async function listJobs(params: JobSearchParams = {}): Promise<JobSearchResult> {
  const {
    q,
    skills = [],
    location,
    salaryMin,
    employmentTypes = [],
    workModes = [],
    experienceLevels = [],
    industries = [],
    postedWithinDays,
    page = 1,
    pageSize = 10,
    sort = "relevance",
  } = params;

  const today = Date.now();
  let result = JOBS.filter((job) => {
    if (job.status !== JOB_STATUS.ACTIVE) return false;
    if (!matchesText(job, q)) return false;
    if (skills.length && !skills.some((s) => job.skillsRequired.concat(job.skillsPreferred).some((js) => js.toLowerCase().includes(s.toLowerCase())))) return false;
    if (location && !job.locations.some((l) => l.toLowerCase().includes(location.toLowerCase()))) return false;
    if (salaryMin && (job.salaryMax ?? 0) < salaryMin) return false;
    if (employmentTypes.length && !employmentTypes.some((e) => job.employmentType === e)) return false;
    if (workModes.length && !workModes.some((w) => job.workMode === w)) return false;
    if (experienceLevels.length && !experienceLevels.some((e) => job.experienceLevel === e)) return false;
    if (industries.length && !industries.some((i) => job.industry === i)) return false;
    if (postedWithinDays && (today - new Date(job.postedAt).getTime()) > postedWithinDays * 86400000) return false;
    return true;
  });

  const sortFn =
    sort === "recent"
      ? (a: Job, b: Job) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      : sort === "salary"
        ? (a: Job, b: Job) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0)
        : (a: Job, b: Job) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);

  result = [...result].sort(sortFn);
  const paged = paginate(result, page, pageSize);

  const withState = paged.items.map((job) => ({
    ...job,
    savedByMe: savedJobs.some((s) => s.jobId === job.id),
  }));

  const countBy = <T,>(values: T[]) => {
    const map = new Map<string, number>();
    for (const v of values) {
      const k = String(v);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  return ok<JobSearchResult>({
    jobs: withState,
    total: paged.total,
    page: paged.page,
    pageSize: paged.pageSize,
    totalPages: paged.totalPages,
    facets: {
      industries: countBy(result.map((j) => j.industry)),
      skills: countBy(result.flatMap((j) => j.skillsRequired)),
    },
  });
}

export async function getJobDetail(id: string): Promise<Job> {
  const job = getJob(id);
  if (!job) notFound("Job not found");
  return ok<Job>({ ...job, savedByMe: savedJobs.some((s) => s.jobId === job.id) }, 250);
}

export async function getJobDetailBySlug(slug: string): Promise<Job> {
  const job = getJobBySlug(slug);
  if (!job) notFound("Job not found");
  return ok<Job>({ ...job, savedByMe: savedJobs.some((s) => s.jobId === job.id) }, 250);
}

export async function getRelatedJobs(jobId: string, limit = 3): Promise<Job[]> {
  const job = getJob(jobId);
  if (!job) return [];
  const related = JOBS.filter(
    (j) =>
      j.id !== jobId &&
      j.status === JOB_STATUS.ACTIVE &&
      (j.industry === job.industry ||
        j.skillsRequired.some((s) => job.skillsRequired.includes(s)) ||
        j.experienceLevel === job.experienceLevel),
  ).slice(0, limit);
  return ok<Job[]>(related, 250);
}

export async function saveJob(jobId: string, userId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) notFound("Job not found");
  if (!savedJobs.some((s) => s.jobId === jobId)) {
    savedJobs = [{ id: `sj-${Date.now()}`, userId, jobId, savedAt: new Date().toISOString() }, ...savedJobs];
  }
  return ok(undefined, 150);
}

export async function unsaveJob(jobId: string): Promise<void> {
  savedJobs = savedJobs.filter((s) => s.jobId !== jobId);
  return ok(undefined, 150);
}

export async function listSavedJobs(userId: string): Promise<Job[]> {
  const jobs = savedJobs
    .filter((s) => s.userId === userId)
    .map((s) => getJob(s.jobId))
    .filter((j): j is Job => Boolean(j));
  return ok<Job[]>(jobs, 250);
}

export async function isJobSaved(jobId: string): Promise<boolean> {
  return ok(savedJobs.some((s) => s.jobId === jobId), 100);
}

export async function toggleFollowCompany(companyId: string): Promise<string[]> {
  followedCompanies = followedCompanies.includes(companyId)
    ? followedCompanies.filter((c) => c !== companyId)
    : [...followedCompanies, companyId];
  return ok(followedCompanies, 150);
}

export async function listFollowedCompanies(): Promise<string[]> {
  return ok(followedCompanies, 150);
}

export async function listSavedSearches(userId: string): Promise<SavedSearch[]> {
  return ok(savedSearches.filter((s) => s.userId === userId), 250);
}

export async function createSavedSearch(input: { userId: string; name: string; filters: JobSearchParams; alertEnabled: boolean }): Promise<SavedSearch> {
  const entry: SavedSearch = {
    id: `ss-${Date.now()}`,
    userId: input.userId,
    name: input.name,
    filters: input.filters,
    alertEnabled: input.alertEnabled,
    createdAt: new Date().toISOString(),
  };
  savedSearches = [entry, ...savedSearches];
  return ok(entry, 200);
}

export async function deleteSavedSearch(id: string): Promise<void> {
  savedSearches = savedSearches.filter((s) => s.id !== id);
  return ok(undefined, 150);
}

export async function listCompanies(): Promise<typeof COMPANIES> {
  return ok(COMPANIES, 300);
}

export async function getCompanyDetail(id: string) {
  const company = COMPANIES.find((c) => c.id === id);
  if (!company) notFound("Company not found");
  const jobs = JOBS.filter((j) => j.companyId === id && j.status === JOB_STATUS.ACTIVE);
  return ok({ company, jobs, followed: followedCompanies.includes(id) }, 300);
}

export async function getJobSkillSuggestions(): Promise<string[]> {
  const skills = new Set<string>();
  for (const job of JOBS) {
    job.skillsRequired.forEach((s) => skills.add(s));
    job.skillsPreferred.forEach((s) => skills.add(s));
  }
  return ok(Array.from(skills).sort(), 150);
}

export const WORK_MODE_OPTIONS = Object.values(WORK_MODE);
export const EMPLOYMENT_TYPE_OPTIONS = Object.values(EMPLOYMENT_TYPE);
