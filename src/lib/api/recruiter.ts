import { APPLICATION_STATUS, INTERVIEW_STATUS, JOB_STATUS } from "@/domain/enums";
import type {
  Application,
  ApplicationStatus,
  ApplicationStageEvent,
  CandidateProfile,
  Company,
  CompanyMember,
  Feedback,
  Interview,
  InterviewFormat,
  Job,
  JobAnalytics,
  JobStatus,
  MatchBreakdown,
  Note,
  Resume,
} from "@/domain/types";
import { notFound, ok, paginate, validationError } from "@/lib/api/client";
import { computeMatch } from "@/lib/match/engine";
import { FEEDBACK, INTERVIEWS, NOTES, RECRUITER_APPLICATIONS_ALL, RECRUITER_STAGE_EVENTS } from "@/lib/mock/applications";
import { COMPANIES, COMPANY_MEMBERS } from "@/lib/mock/companies";
import { JOBS, addJob, updateJobInStore } from "@/lib/mock/jobs";
import { CANDIDATE_PROFILES } from "@/lib/mock/users";
import { getResume } from "@/lib/mock/resumes";

const applicantStore = new Map(RECRUITER_APPLICATIONS_ALL.map((a) => [a.id, a]));
let stageEvents: ApplicationStageEvent[] = [...RECRUITER_STAGE_EVENTS];
const interviewsStore = new Map(INTERVIEWS.map((i) => [i.id, i]));
const notesStore = new Map(NOTES.map((n) => [n.id, n]));
const feedbackStore = new Map(FEEDBACK.map((f) => [f.id, f]));

export interface ApplicantProfilePreview {
  profile: CandidateProfile;
  resume?: Resume;
  email: string;
  skills: string[];
}

export function getActiveJobs(): Job[] {
  return JOBS.filter((j) => j.status === JOB_STATUS.ACTIVE);
}

export async function listCompanyJobs(companyId: string): Promise<Job[]> {
  const jobs = JOBS
    .filter((j) => j.companyId === companyId)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  return ok(jobs, 250);
}

export async function listApplicants(params: {
  jobId?: string;
  stage?: ApplicationStatus;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Application[]; total: number; totalPages: number; page: number }> {
  const { jobId, stage, query, page = 1, pageSize = 20 } = params;
  let items = Array.from(applicantStore.values());
  if (jobId) items = items.filter((a) => a.jobId === jobId);
  if (stage) items = items.filter((a) => a.status === stage);
  if (query?.trim()) {
    const q = query.toLowerCase();
    items = items.filter(
      (a) => a.candidateName.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q),
    );
  }
  items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paged = paginate(items, page, pageSize);
  return ok({ items: paged.items, total: paged.total, totalPages: paged.totalPages, page: paged.page }, 300);
}

export function getApplicant(id: string): Application | undefined {
  return applicantStore.get(id);
}

export async function moveApplicantStage(
  applicationId: string,
  to: ApplicationStatus,
  note?: string,
  actorName = "Marcus Reed",
): Promise<Application> {
  const app = applicantStore.get(applicationId);
  if (!app) notFound("Application not found");
  if (app.status === to) return ok(app, 150);

  const event: ApplicationStageEvent = {
    id: `evt-${Date.now()}`,
    applicationId,
    from: app.status,
    to,
    actorId: "u-demo-rec",
    actorName,
    note,
    createdAt: new Date().toISOString(),
  };
  stageEvents = [event, ...stageEvents];
  const updated = { ...app, status: to, updatedAt: new Date().toISOString() };
  applicantStore.set(applicationId, updated);
  return ok(updated, 250);
}

export async function getApplicantDetail(applicationId: string): Promise<{
  application: Application;
  stageHistory: ApplicationStageEvent[];
  notes: Note[];
  feedback: Feedback[];
  matchBreakdown: MatchBreakdown;
  profile?: ApplicantProfilePreview;
}> {
  const app = applicantStore.get(applicationId);
  if (!app) notFound("Application not found");
  const job = JOBS.find((j) => j.id === app.jobId);
  const candidateProfile = CANDIDATE_PROFILES.find((p) => p.userId === app.candidateId);
  const resume = getResume(app.resumeId);
  const matchBreakdown = candidateProfile && job ? computeMatch(candidateProfile, job) : emptyMatch(app.matchScore);

  return ok(
    {
      application: app,
      stageHistory: stageEvents
        .filter((e) => e.applicationId === applicationId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      notes: Array.from(notesStore.values())
        .filter((n) => n.applicationId === applicationId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      feedback: Array.from(feedbackStore.values()).filter((f) => f.applicationId === applicationId),
      matchBreakdown,
      profile: candidateProfile
        ? {
            profile: candidateProfile,
            resume,
            email: app.candidateName,
            skills: candidateProfile.skills,
          }
        : undefined,
    },
    350,
  );
}

function emptyMatch(score: number): MatchBreakdown {
  return {
    score,
    totalWeight: 1,
    matchedWeight: 1,
    criteria: [],
    generatedByModel: "deterministic-v1",
    generatedAt: new Date().toISOString(),
  };
}

export async function addNote(applicationId: string, body: string, isPrivate: boolean, authorName = "Marcus Reed"): Promise<Note> {
  if (!body.trim()) validationError("Note body is required.");
  const note: Note = {
    id: `note-${Date.now()}`,
    applicationId,
    authorId: "u-demo-rec",
    authorName,
    body,
    isPrivate,
    createdAt: new Date().toISOString(),
  };
  notesStore.set(note.id, note);
  return ok(note, 200);
}

export async function addFeedback(input: {
  applicationId: string;
  score: number;
  strengths: string;
  concerns: string;
  recommendation: Feedback["recommendation"];
  authorName?: string;
}): Promise<Feedback> {
  if (input.score < 1 || input.score > 10) validationError("Score must be between 1 and 10.");
  const fb: Feedback = {
    id: `fb-${Date.now()}`,
    applicationId: input.applicationId,
    interviewerId: "u-demo-hm",
    interviewerName: input.authorName ?? "Priya Nair",
    score: input.score,
    strengths: input.strengths,
    concerns: input.concerns,
    recommendation: input.recommendation,
    createdAt: new Date().toISOString(),
  };
  feedbackStore.set(fb.id, fb);
  return ok(fb, 200);
}

export async function listInterviews(): Promise<Interview[]> {
  const items = Array.from(interviewsStore.values()).sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
  return ok(items, 250);
}

export async function scheduleInterview(input: {
  applicationId: string;
  scheduledAt: string;
  durationMin: number;
  format: InterviewFormat;
  participants: string[];
  agenda: string;
}): Promise<Interview> {
  if (!input.scheduledAt) validationError("A date and time is required.");
  if (input.participants.length < 1) validationError("Add at least one participant.");
  const app = applicantStore.get(input.applicationId);
  if (!app) notFound("Application not found");
  const interview: Interview = {
    id: `int-${Date.now()}`,
    applicationId: input.applicationId,
    jobTitle: app.jobTitle,
    candidateName: app.candidateName,
    interviewerIds: ["u-demo-hm"],
    scheduledAt: input.scheduledAt,
    durationMin: input.durationMin || 60,
    format: input.format,
    participants: [app.candidateName, ...input.participants],
    agenda: input.agenda,
    status: INTERVIEW_STATUS.SCHEDULED,
    createdAt: new Date().toISOString(),
  };
  interviewsStore.set(interview.id, interview);
  return ok(interview, 300);
}

export function getInterview(id: string): Interview | undefined {
  return interviewsStore.get(id);
}

export async function getJobAnalytics(jobId: string): Promise<JobAnalytics> {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) notFound("Job not found");
  const apps = Array.from(applicantStore.values()).filter((a) => a.jobId === jobId);

  const perStage = (Object.values(APPLICATION_STATUS) as ApplicationStatus[]).map((stage) => ({
    stage,
    count: apps.filter((a) => a.status === stage).length,
  }));

  const bySource = new Map<string, number>();
  apps.forEach((a) => bySource.set(a.source, (bySource.get(a.source) ?? 0) + 1));

  const trend = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date(Date.now() - (13 - i) * 86400000);
    const dayStart = date.toISOString().slice(0, 10);
    const count = apps.filter((a) => a.createdAt.slice(0, 10) === dayStart).length;
    return { date: dayStart, applications: count, views: Math.round(count * (job.isFeatured ? 9 : 5)) };
  });

  const conversion = [
    { label: "Applied → Screening", from: 100, to: 50, rate: 50 },
    { label: "Screening → Shortlisted", from: 50, to: 30, rate: 60 },
    { label: "Shortlisted → Interview", from: 30, to: 20, rate: 67 },
    { label: "Interview → Offer", from: 20, to: 10, rate: 50 },
    { label: "Offer → Hired", from: 10, to: 5, rate: 50 },
  ];

  return ok(
    {
      jobId,
      jobTitle: job.title,
      views: apps.length * 8 + job.applicationsCount,
      applicationsTotal: job.applicationsCount,
      perStage,
      conversion,
      bySource: Array.from(bySource.entries()).map(([source, count]) => ({ source, count })),
      avgResponseTimeHours: 21,
      timeInStageDays: perStage.map((s) => ({ stage: s.stage, medianDays: Math.max(0.5, s.count * 0.7) })),
      trend,
    },
    350,
  );
}

export async function getCompanyInfo(companyId: string): Promise<{ company: Company; members: CompanyMember[]; ownerName: string }> {
  const company = COMPANIES.find((c) => c.id === companyId);
  if (!company) notFound("Company not found");
  const members = COMPANY_MEMBERS.filter((m) => m.companyId === companyId);
  return ok({ company, members, ownerName: "Ava Thompson" }, 250);
}

export async function updateCompany(companyId: string, input: Partial<Company>): Promise<Company> {
  const index = COMPANIES.findIndex((c) => c.id === companyId);
  if (index === -1) notFound("Company not found");
  COMPANIES[index] = { ...COMPANIES[index], ...input };
  return ok(COMPANIES[index], 300);
}

export async function createJob(input: Partial<Job> & { companyId: string; title: string }): Promise<Job> {
  if (!input.title?.trim()) validationError("Job title is required.");
  const job: Job = {
    id: `job-${Date.now()}`,
    companyId: input.companyId,
    companyName: "NovaTech",
    companyVerified: true,
    title: input.title.trim(),
    slug: input.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    summary: input.summary ?? "",
    description: input.description ?? "",
    responsibilities: input.responsibilities ?? [],
    requirements: input.requirements ?? [],
    preferredQualifications: input.preferredQualifications ?? [],
    benefits: input.benefits ?? [],
    salaryMin: input.salaryMin ?? 0,
    salaryMax: input.salaryMax ?? 0,
    salaryCurrency: input.salaryCurrency ?? "USD",
    employmentType: input.employmentType ?? "Full-time",
    workMode: input.workMode ?? "Remote",
    experienceLevel: input.experienceLevel ?? "Entry level",
    industry: input.industry ?? "Software Development",
    locations: input.locations ?? ["Remote"],
    skillsRequired: input.skillsRequired ?? [],
    skillsPreferred: input.skillsPreferred ?? [],
    status: JOB_STATUS.ACTIVE,
    isFeatured: false,
    postedAt: new Date().toISOString(),
    deadline: input.deadline ?? new Date(Date.now() + 30 * 86400000).toISOString(),
    applicationsCount: 0,
    source: "portal",
  };
  addJob(job);
  return ok(job, 400);
}

export async function updateJob(jobId: string, input: Partial<Job>): Promise<Job> {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) notFound("Job not found");
  const updated = { ...job, ...input };
  updateJobInStore(updated);
  return ok(updated, 300);
}

export async function setJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) notFound("Job not found");
  const updated = { ...job, status };
  updateJobInStore(updated);
  return ok(updated, 250);
}

export function getJobForEdit(jobId: string): Job | undefined {
  return JOBS.find((j) => j.id === jobId);
}
