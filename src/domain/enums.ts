export const ROLE = {
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  HIRING_MANAGER: "hiring_manager",
  ADMIN: "administrator",
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const JOB_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  CLOSED: "closed",
} as const;
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const APPLICATION_STATUS = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
} as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const WORK_MODE = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
} as const;
export type WorkMode = (typeof WORK_MODE)[keyof typeof WORK_MODE];

export const EMPLOYMENT_TYPE = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
} as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

export const EXPERIENCE_LEVEL = {
  ENTRY: "Entry level",
  JUNIOR: "Junior",
  MID: "Mid level",
  SENIOR: "Senior level",
  LEAD: "Lead",
} as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];

export const RESUME_STATUS = {
  UPLOADING: "uploading",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
  MALWARE_REJECTED: "malware_rejected",
} as const;
export type ResumeStatus = (typeof RESUME_STATUS)[keyof typeof RESUME_STATUS];

export const COMPANY_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  SUSPENDED: "suspended",
} as const;
export type CompanyStatus = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];

export const COMPANY_MEMBER_ROLE = {
  OWNER: "owner",
  RECRUITER: "recruiter",
  HIRING_MANAGER: "hiring_manager",
  ADMIN: "admin",
} as const;
export type CompanyMemberRole = (typeof COMPANY_MEMBER_ROLE)[keyof typeof COMPANY_MEMBER_ROLE];

export const INTERVIEW_FORMAT = {
  PHONE: "Phone",
  VIDEO: "Video",
  ONSITE: "On-site",
  TECHNICAL: "Technical",
} as const;
export type InterviewFormat = (typeof INTERVIEW_FORMAT)[keyof typeof INTERVIEW_FORMAT];

export const INTERVIEW_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
export type InterviewStatus = (typeof INTERVIEW_STATUS)[keyof typeof INTERVIEW_STATUS];

export const NOTIFICATION_TYPE = {
  APPLICATION: "application",
  STAGE: "stage",
  INTERVIEW: "interview",
  MESSAGE: "message",
  SYSTEM: "system",
  AI: "ai",
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const REPORT_STATUS = {
  OPEN: "open",
  RESOLVING: "resolving",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const CONTENT_TYPE = {
  USER: "user",
  COMPANY: "company",
  JOB: "job",
  REVIEW: "review",
} as const;
export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

export const AI_JOB_TYPE = {
  RESUME_PARSING: "resume_parsing",
  JOB_SKILL_EXTRACTION: "job_skill_extraction",
  MATCH: "match",
  RECOMMENDATION: "recommendation",
  JD_ASSISTANT: "jd_assistant",
} as const;
export type AIJobType = (typeof AI_JOB_TYPE)[keyof typeof AI_JOB_TYPE];

export const AI_JOB_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  DEAD: "dead",
} as const;
export type AIJobStatus = (typeof AI_JOB_STATUS)[keyof typeof AI_JOB_STATUS];

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const SUBSCRIPTION_PLAN = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

export const MATCH_CRITERION_STATE = {
  MATCHED: "matched",
  MISSING: "missing",
  UNCERTAIN: "uncertain",
} as const;
export type MatchCriterionState = (typeof MATCH_CRITERION_STATE)[keyof typeof MATCH_CRITERION_STATE];
