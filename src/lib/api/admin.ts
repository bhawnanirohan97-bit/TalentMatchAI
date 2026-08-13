import { CONTENT_TYPE, REPORT_STATUS } from "@/domain/enums";
import type { AdminOverview, AuditEvent, AIProcessingJob, ContentType, Report, ReportStatus, SystemJob, User, UserStatus } from "@/domain/types";
import { notFound, ok, paginate } from "@/lib/api/client";
import { AI_JOBS, AUDIT_EVENTS, REPORTS, SYSTEM_JOBS } from "@/lib/mock/admin";
import { USERS } from "@/lib/mock/users";
import { daysAgoIso } from "@/lib/utils";

const reportsStore = new Map(REPORTS.map((r) => [r.id, r]));
let auditEvents: AuditEvent[] = [...AUDIT_EVENTS];
const usersStore = new Map(USERS.map((u) => [u.id, u]));

export async function getAdminOverview(): Promise<AdminOverview> {
  const signupTrend = Array.from({ length: 14 }).map((_, i) => {
    const date = daysAgoIso(13 - i).slice(0, 10);
    return { date, count: Math.max(1, (i * 7) % 23) };
  });
  const applicationsTrend = Array.from({ length: 14 }).map((_, i) => {
    const date = daysAgoIso(13 - i).slice(0, 10);
    return { date, count: Math.max(2, (i * 13) % 41) };
  });
  return ok<AdminOverview>(
    {
      signupsToday: 42,
      signupsWeek: 318,
      activeJobs: 16,
      pendingJobs: 3,
      applicationsTotal: 1240,
      applicationsToday: 87,
      moderationQueue: REPORTS.filter((r) => r.status === REPORT_STATUS.OPEN).length,
      failedProcessing: AI_JOBS.filter((j) => j.status === "failed" || j.status === "dead").length,
      openReports: REPORTS.filter((r) => r.status === REPORT_STATUS.OPEN).length,
      signupTrend,
      applicationsTrend,
      processingHealth: {
        total: AI_JOBS.length,
        succeeded: AI_JOBS.filter((j) => j.status === "succeeded").length,
        failed: AI_JOBS.filter((j) => j.status === "failed").length,
        dead: AI_JOBS.filter((j) => j.status === "dead").length,
      },
    },
    350,
  );
}

export async function listReports(params: { status?: ReportStatus; page?: number; pageSize?: number } = {}): Promise<{ items: Report[]; total: number; totalPages: number; page: number }> {
  let items = Array.from(reportsStore.values());
  if (params.status) items = items.filter((r) => r.status === params.status);
  items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paged = paginate(items, params.page ?? 1, params.pageSize ?? 10);
  return ok({ items: paged.items, total: paged.total, totalPages: paged.totalPages, page: paged.page }, 300);
}

export function getReport(id: string): Report | undefined {
  return reportsStore.get(id);
}

export async function resolveReport(input: {
  reportId: string;
  action: string;
  reasonCode: string;
  note: string;
  actorName?: string;
}): Promise<Report> {
  const report = reportsStore.get(input.reportId);
  if (!report) notFound("Report not found");
  const resolved: Report = {
    ...report,
    status: input.action === "dismiss" ? REPORT_STATUS.DISMISSED : REPORT_STATUS.RESOLVED,
    resolution: {
      reasonCode: input.reasonCode,
      action: input.action,
      note: input.note,
      resolvedById: "u-demo-admin",
      resolvedByName: input.actorName ?? "Jordan Ellis",
      resolvedAt: new Date().toISOString(),
    },
  };
  reportsStore.set(report.id, resolved);
  auditEvents = [
    {
      id: `aud-${Date.now()}`,
      actorId: "u-demo-admin",
      actorName: input.actorName ?? "Jordan Ellis",
      actorRole: "Administrator",
      action: "report.resolved",
      entityType: "Report",
      entityId: report.id,
      entityLabel: report.contentTitle,
      details: `Resolved with action "${input.action}".`,
      ipAddress: "198.51.100.7",
      createdAt: new Date().toISOString(),
    },
    ...auditEvents,
  ];
  return ok(resolved, 400);
}

export async function setUserStatus(userId: string, status: UserStatus): Promise<User> {
  const user = usersStore.get(userId);
  if (!user) notFound("User not found");
  const updated = { ...user, status };
  usersStore.set(userId, updated);
  return ok(updated, 250);
}

export async function listUsers(params: { query?: string; status?: UserStatus; page?: number; pageSize?: number } = {}): Promise<{ items: User[]; total: number; totalPages: number; page: number }> {
  let items = Array.from(usersStore.values());
  if (params.status) items = items.filter((u) => u.status === params.status);
  if (params.query?.trim()) {
    const q = params.query.toLowerCase();
    items = items.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paged = paginate(items, params.page ?? 1, params.pageSize ?? 12);
  return ok({ items: paged.items, total: paged.total, totalPages: paged.totalPages, page: paged.page }, 300);
}

export async function listAuditEvents(params: { page?: number; pageSize?: number; action?: string } = {}): Promise<{ items: AuditEvent[]; total: number; totalPages: number; page: number }> {
  let items = [...auditEvents];
  if (params.action) items = items.filter((e) => e.action === params.action);
  items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paged = paginate(items, params.page ?? 1, params.pageSize ?? 12);
  return ok({ items: paged.items, total: paged.total, totalPages: paged.totalPages, page: paged.page }, 300);
}

export async function listSystemJobs(): Promise<SystemJob[]> {
  const items = [...SYSTEM_JOBS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(items, 300);
}

export async function listAIJobs(): Promise<AIProcessingJob[]> {
  const items = [...AI_JOBS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(items, 300);
}

export async function retryAIJob(jobId: string): Promise<AIProcessingJob> {
  const job = AI_JOBS.find((j) => j.id === jobId);
  if (!job) notFound("Job not found");
  const updated = { ...job, status: "queued" as const, attempts: job.attempts + 1, error: undefined };
  Object.assign(job, updated);
  return ok(updated, 250);
}

export const TAXONOMIES = [
  {
    id: "tax-skills",
    name: "Skills",
    count: 214,
    description: "Canonical skill terms used for matching and search normalization.",
    entries: [
      { id: "skill-001", label: "TypeScript", aliases: ["TS", "typescript"], status: "active" },
      { id: "skill-002", label: "React", aliases: ["React.js", "ReactJS"], status: "active" },
      { id: "skill-003", label: "Next.js", aliases: ["Next", "NextJS"], status: "active" },
      { id: "skill-004", label: "Node.js", aliases: ["Node", "NodeJS"], status: "active" },
      { id: "skill-005", label: "PostgreSQL", aliases: ["Postgres", "PSQL"], status: "active" },
      { id: "skill-006", label: "Python", aliases: [], status: "active" },
      { id: "skill-007", label: "SQL", aliases: ["Structured Query Language"], status: "active" },
      { id: "skill-008", label: "Tailwind CSS", aliases: ["Tailwind"], status: "active" },
      { id: "skill-009", label: "Tailwind (legacy)", aliases: [], status: "deprecated" },
      { id: "skill-010", label: "Docker", aliases: ["Containers"], status: "active" },
    ],
  },
  {
    id: "tax-industries",
    name: "Industries",
    count: 28,
    description: "Industry taxonomy used for job classification and filtering.",
    entries: [
      { id: "ind-001", label: "Software Development", aliases: ["Software", "SaaS"], status: "active" },
      { id: "ind-002", label: "Information Technology", aliases: ["IT"], status: "active" },
      { id: "ind-003", label: "Data & Analytics", aliases: ["Data"], status: "active" },
      { id: "ind-004", label: "Fintech", aliases: ["Financial Technology"], status: "active" },
      { id: "ind-005", label: "Cybersecurity", aliases: ["Security"], status: "active" },
      { id: "ind-006", label: "Healthcare Technology", aliases: ["HealthTech", "Health Tech"], status: "active" },
      { id: "ind-007", label: "Artificial Intelligence", aliases: ["AI", "ML"], status: "active" },
    ],
  },
  {
    id: "tax-pipeline",
    name: "Pipeline defaults",
    count: 8,
    description: "Default hiring pipeline stages applied to new companies.",
    entries: [
      { id: "pp-001", label: "Applied", aliases: [], status: "active" },
      { id: "pp-002", label: "Screening", aliases: [], status: "active" },
      { id: "pp-003", label: "Shortlisted", aliases: [], status: "active" },
      { id: "pp-004", label: "Interview", aliases: [], status: "active" },
      { id: "pp-005", label: "Offer", aliases: [], status: "active" },
      { id: "pp-006", label: "Hired", aliases: [], status: "active" },
      { id: "pp-007", label: "Rejected", aliases: [], status: "active" },
      { id: "pp-008", label: "Withdrawn", aliases: [], status: "active" },
    ],
  },
  {
    id: "tax-locations",
    name: "Locations",
    count: 112,
    description: "Canonical location terms for job listings and search.",
    entries: [
      { id: "loc-001", label: "Remote", aliases: ["Anywhere"], status: "active" },
      { id: "loc-002", label: "New York, NY", aliases: ["NYC", "New York City"], status: "active" },
      { id: "loc-003", label: "San Francisco, CA", aliases: ["SF", "Bay Area"], status: "active" },
      { id: "loc-004", label: "Austin, TX", aliases: [], status: "active" },
      { id: "loc-005", label: "Seattle, WA", aliases: [], status: "active" },
      { id: "loc-006", label: "Chicago, IL", aliases: [], status: "active" },
    ],
  },
];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  [CONTENT_TYPE.USER]: "User",
  [CONTENT_TYPE.COMPANY]: "Company",
  [CONTENT_TYPE.JOB]: "Job",
  [CONTENT_TYPE.REVIEW]: "Review",
};
