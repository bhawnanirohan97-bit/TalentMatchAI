import { APPLICATION_STATUS, RESUME_STATUS } from "@/domain/enums";
import type {
  Application,
  ApplicationStageEvent,
  CandidateProfile,
  Job,
  MatchBreakdown,
  Recommendation,
  Resume,
} from "@/domain/types";
import { conflict, forbidden, ok, notFound, paginate, validationError } from "@/lib/api/client";
import { computeMatch, computeRecommendations } from "@/lib/match/engine";
import { CANDIDATE_PROFILES, getUser } from "@/lib/mock/users";
import { RESUMES } from "@/lib/mock/resumes";
import { JOBS } from "@/lib/mock/jobs";
import { DEMO_CANDIDATE_APPLICATIONS, DEMO_CANDIDATE_STAGE_EVENTS } from "@/lib/mock/applications";

const profileStore = new Map(CANDIDATE_PROFILES.map((p) => [p.id, p]));
const resumeStore = new Map(RESUMES.map((r) => [r.id, r]));
const applicationsStore = new Map(DEMO_CANDIDATE_APPLICATIONS.map((a) => [a.id, a]));
const dismissedRecommendations: Record<string, boolean> = {};

export async function getCandidateProfile(userId: string): Promise<CandidateProfile> {
  const profile = Array.from(profileStore.values()).find((p) => p.userId === userId);
  if (!profile) notFound("Profile not found");
  return ok(profile, 250);
}

export async function updateCandidateProfile(
  userId: string,
  input: Partial<CandidateProfile>,
): Promise<CandidateProfile> {
  const existing = Array.from(profileStore.values()).find((p) => p.userId === userId);
  if (!existing) notFound("Profile not found");
  if (!input.headline?.trim() || !input.summary?.trim()) {
    validationError("Headline and summary are required.");
  }
  const updated: CandidateProfile = {
    ...existing,
    ...input,
    completed: Boolean(input.headline?.trim() && input.summary?.trim() && (input.skills?.length ?? existing.skills.length) > 0),
    updatedAt: new Date().toISOString(),
  };
  profileStore.set(updated.id, updated);
  return ok(updated, 400);
}

export async function listResumes(userId: string): Promise<Resume[]> {
  const resumes = Array.from(resumeStore.values()).filter((r) => r.userId === userId);
  return ok(resumes, 250);
}

export async function uploadResume(
  userId: string,
  file: { name: string; type: string; size: number },
): Promise<Resume> {
  if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".docx")) {
    validationError("Only PDF and DOCX files are supported.");
  }
  if (file.size > 5 * 1024 * 1024) {
    validationError("File must be smaller than 5 MB.");
  }
  const resume: Resume = {
    id: `res-${Date.now()}`,
    userId,
    fileName: file.name,
    fileType: file.type,
    sizeBytes: file.size,
    status: RESUME_STATUS.PROCESSING,
    isPrimary: false,
    uploadedAt: new Date().toISOString(),
    structured: { skills: [], roles: [], dates: [], education: [], links: [] },
  };
  resumeStore.set(resume.id, resume);
  setTimeout(() => {
    const r = resumeStore.get(resume.id);
    if (r) {
      resumeStore.set(resume.id, { ...r, status: RESUME_STATUS.READY, processedAt: new Date().toISOString() });
    }
  }, 2500);
  return ok(resume, 500);
}

export async function deleteResume(resumeId: string): Promise<void> {
  if (!resumeStore.delete(resumeId)) notFound("Resume not found");
  return ok(undefined, 150);
}

export async function setPrimaryResume(resumeId: string): Promise<void> {
  const target = resumeStore.get(resumeId);
  if (!target) notFound("Resume not found");
  for (const [id, r] of resumeStore) {
    if (r.userId === target.userId) resumeStore.set(id, { ...r, isPrimary: false });
  }
  resumeStore.set(resumeId, { ...target, isPrimary: true });
  return ok(undefined, 150);
}

export async function getApplication(id: string): Promise<{
  application: Application;
  stageHistory: ApplicationStageEvent[];
  matchBreakdown: MatchBreakdown;
  job: Job;
}> {
  const application = applicationsStore.get(id);
  if (!application) notFound("Application not found");
  const job = JOBS.find((j) => j.id === application.jobId);
  if (!job) notFound("Job not found");
  const profile = Array.from(profileStore.values()).find((p) => p.userId === application.candidateId);
  const matchBreakdown = profile
    ? computeMatch(profile, job)
    : {
        score: application.matchScore,
        totalWeight: 1,
        matchedWeight: 1,
        criteria: [],
        generatedByModel: "deterministic-v1",
        generatedAt: new Date().toISOString(),
      };
  const stageHistory = DEMO_CANDIDATE_STAGE_EVENTS.filter(
    (e) => e.applicationId === id,
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok({ application, stageHistory, matchBreakdown, job }, 350);
}

export async function getMyApplications(
  userId: string,
  page = 1,
  pageSize = 10,
): Promise<{ items: Application[]; total: number; totalPages: number; page: number }> {
  const items = Array.from(applicationsStore.values())
    .filter((a) => a.candidateId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paged = paginate(items, page, pageSize);
  return ok({ items: paged.items, total: paged.total, totalPages: paged.totalPages, page: paged.page }, 300);
}

export async function submitApplication(input: {
  userId: string;
  jobId: string;
  resumeId: string;
  coverLetter?: string;
}): Promise<Application> {
  const job = JOBS.find((j) => j.id === input.jobId);
  if (!job) notFound("Job not found");
  const existing = Array.from(applicationsStore.values()).find(
    (a) => a.candidateId === input.userId && a.jobId === input.jobId,
  );
  if (existing) conflict("You have already applied to this job.");
  const resume = resumeStore.get(input.resumeId);
  if (!resume) notFound("Resume not found");
  if (resume.status !== RESUME_STATUS.READY) validationError("Select a processed resume.");

  const user = getUser(input.userId);
  const profile = Array.from(profileStore.values()).find((p) => p.userId === input.userId);
  const matchBreakdown = profile ? computeMatch(profile, job) : undefined;

  const application: Application = {
    id: `app-${Date.now()}`,
    candidateId: input.userId,
    candidateName: user?.name ?? "Candidate",
    jobId: job.id,
    jobTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogoUrl: job.companyLogoUrl,
    resumeId: resume.id,
    resumeFileName: resume.fileName,
    coverLetter: input.coverLetter ?? "",
    status: APPLICATION_STATUS.APPLIED,
    matchScore: matchBreakdown?.score ?? 0,
    matchBreakdown,
    source: "portal",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  applicationsStore.set(application.id, application);
  return ok(application, 600);
}

export async function withdrawApplication(applicationId: string): Promise<Application> {
  const application = applicationsStore.get(applicationId);
  if (!application) notFound("Application not found");
  if (
    application.status === APPLICATION_STATUS.HIRED ||
    application.status === APPLICATION_STATUS.REJECTED ||
    application.status === APPLICATION_STATUS.WITHDRAWN
  ) {
    forbidden("This application can no longer be withdrawn.");
  }
  const updated = { ...application, status: APPLICATION_STATUS.WITHDRAWN, updatedAt: new Date().toISOString() };
  applicationsStore.set(applicationId, updated);
  return ok(updated, 300);
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const profile = Array.from(profileStore.values()).find((p) => p.userId === userId);
  if (!profile) return ok([], 250);
  const appliedJobIds = new Set(
    Array.from(applicationsStore.values())
      .filter((a) => a.candidateId === userId)
      .map((a) => a.jobId),
  );
  const ranked = computeRecommendations(
    profile,
    JOBS.filter((j) => !appliedJobIds.has(j.id)),
  );
  return ok(
    ranked
      .map((r) => ({
        job: { ...r.job, savedByMe: false },
        reason: r.reason,
        matchScore: r.score,
        dismissed: dismissedRecommendations[r.job.id] === true,
      }))
      .filter((r) => !r.dismissed)
      .slice(0, 6),
    350,
  );
}

export async function dismissRecommendation(jobId: string): Promise<void> {
  dismissedRecommendations[jobId] = true;
  return ok(undefined, 100);
}

export async function submitMatchFeedback(_input: {
  jobId: string;
  rating: "helpful" | "not_helpful";
  comment?: string;
}): Promise<void> {
  void _input;
  return ok(undefined, 100);
}
