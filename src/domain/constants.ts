import { APPLICATION_STATUS, ROLE } from "@/domain/enums";
import type { ApplicationStatus, Role } from "@/domain/enums";

export const PIPELINE_STAGES: ApplicationStatus[] = [
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.SCREENING,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFER,
  APPLICATION_STATUS.HIRED,
];

export const TERMINAL_STAGES: ApplicationStatus[] = [
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.WITHDRAWN,
];

export const STAGE_META: Record<
  ApplicationStatus,
  { dot: string; badge: string; label: string }
> = {
  [APPLICATION_STATUS.APPLIED]: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    label: "Applied",
  },
  [APPLICATION_STATUS.SCREENING]: {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    label: "Screening",
  },
  [APPLICATION_STATUS.SHORTLISTED]: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    label: "Shortlisted",
  },
  [APPLICATION_STATUS.INTERVIEW]: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    label: "Interview",
  },
  [APPLICATION_STATUS.OFFER]: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    label: "Offer",
  },
  [APPLICATION_STATUS.HIRED]: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    label: "Hired",
  },
  [APPLICATION_STATUS.REJECTED]: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    label: "Rejected",
  },
  [APPLICATION_STATUS.WITHDRAWN]: {
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    label: "Withdrawn",
  },
};

export const ROLE_LABEL: Record<Role, string> = {
  [ROLE.CANDIDATE]: "Candidate",
  [ROLE.RECRUITER]: "Recruiter",
  [ROLE.HIRING_MANAGER]: "Hiring manager",
  [ROLE.ADMIN]: "Administrator",
};

export const WORKSPACE_HOME: Record<Role, string> = {
  [ROLE.CANDIDATE]: "/candidate",
  [ROLE.RECRUITER]: "/recruiter",
  [ROLE.HIRING_MANAGER]: "/recruiter",
  [ROLE.ADMIN]: "/admin",
};

export const SKILL_SUGGESTIONS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "PostgreSQL",
  "Redis",
  "Docker",
  "AWS",
  "GraphQL",
  "REST APIs",
  "Git",
  "CI/CD",
  "Testing",
  "HTML",
  "CSS",
  "JavaScript",
  "Java",
  "Go",
  "MongoDB",
  "Kubernetes",
  "Tailwind CSS",
  "Machine Learning",
  "Data Analysis",
  "Communication",
];

export const INDUSTRIES = [
  "Software Development",
  "Information Technology",
  "Data & Analytics",
  "Fintech",
  "Healthcare Technology",
  "E-commerce",
  "Cybersecurity",
  "Artificial Intelligence",
  "Design & Creative",
  "Marketing",
];

export const LOCATIONS = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "Seattle, WA",
  "Chicago, IL",
  "Boston, MA",
  "Denver, CO",
  "Atlanta, GA",
  "Los Angeles, CA",
];

export const SORT_OPTIONS = [
  { value: "relevance", label: "Most relevant" },
  { value: "recent", label: "Most recent" },
  { value: "salary", label: "Highest salary" },
] as const;

export const INTERVIEW_FORMAT_LABELS = [
  "Phone",
  "Video",
  "On-site",
  "Technical",
];

export const REPORT_REASON_CODES = [
  "spam_or_fraud",
  "inappropriate_content",
  "fake_job_listing",
  "discrimination",
  "harassment",
  "impersonation",
  "other",
];

export const REPORT_REASON_LABELS: Record<string, string> = {
  spam_or_fraud: "Spam or fraudulent content",
  inappropriate_content: "Inappropriate content",
  fake_job_listing: "Fake job listing",
  discrimination: "Discriminatory language",
  harassment: "Harassment or abuse",
  impersonation: "Impersonation",
  other: "Other",
};

export const MODERATION_ACTIONS = [
  { value: "warn", label: "Send warning" },
  { value: "suspend_content", label: "Suspend content" },
  { value: "suspend_account", label: "Suspend account" },
  { value: "remove", label: "Remove permanently" },
  { value: "dismiss", label: "Dismiss report" },
];
