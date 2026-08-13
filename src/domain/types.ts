import type {
  AIJobStatus,
  AIJobType,
  ApplicationStatus,
  CompanyMemberRole,
  CompanyStatus,
  ContentType,
  EmploymentType,
  ExperienceLevel,
  InterviewFormat,
  InterviewStatus,
  JobStatus,
  MatchCriterionState,
  NotificationType,
  ReportStatus,
  ResumeStatus,
  Role,
  SubscriptionPlan,
  UserStatus,
  WorkMode,
} from "@/domain/enums";

export type {
  AIJobStatus,
  AIJobType,
  ApplicationStatus,
  CompanyMemberRole,
  CompanyStatus,
  ContentType,
  EmploymentType,
  ExperienceLevel,
  InterviewFormat,
  InterviewStatus,
  JobStatus,
  MatchCriterionState,
  NotificationType,
  ReportStatus,
  ResumeStatus,
  Role,
  SubscriptionPlan,
  UserStatus,
  WorkMode,
} from "@/domain/enums";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: Role[];
  status: UserStatus;
  verifiedEmail: boolean;
  createdAt: string;
  candidateProfileId?: string;
  companyIds?: string[];
  headline?: string;
}

export interface CandidatePreferences {
  remoteOnly: boolean;
  openToRelocation: boolean;
  desiredRoles: string[];
  workModes: WorkMode[];
  jobAlertFrequency: "realtime" | "daily" | "weekly" | "none";
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  location: string;
  workAuthorization: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  skills: string[];
  links: { label: string; url: string }[];
  preferences: CandidatePreferences;
  completed: boolean;
  updatedAt: string;
}

export interface StructuredResume {
  skills: string[];
  roles: string[];
  dates: { title: string; start: string; end?: string }[];
  education: { school: string; degree: string; year?: string }[];
  links: string[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  status: ResumeStatus;
  isPrimary: boolean;
  uploadedAt: string;
  processedAt?: string;
  error?: string;
  structured: StructuredResume;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  website: string;
  locations: string[];
  industry: string;
  sizeRange: string;
  foundedYear: number;
  culture: string;
  benefits: string[];
  contactPolicy: string;
  verified: boolean;
  status: CompanyStatus;
  jobCount: number;
  createdAt: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyMemberRole;
  joinedAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  companyVerified: boolean;
  title: string;
  slug: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  industry: string;
  locations: string[];
  skillsRequired: string[];
  skillsPreferred: string[];
  status: JobStatus;
  isFeatured: boolean;
  postedAt: string;
  deadline: string;
  applicationsCount: number;
  source: "portal" | "external";
  savedByMe?: boolean;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  notes?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: JobSearchParams;
  alertEnabled: boolean;
  createdAt: string;
}

export interface JobSearchParams {
  q?: string;
  skills?: string[];
  location?: string;
  salaryMin?: number;
  employmentTypes?: EmploymentType[];
  workModes?: WorkMode[];
  experienceLevels?: ExperienceLevel[];
  industries?: string[];
  postedWithinDays?: number;
  page?: number;
  pageSize?: number;
  sort?: "relevance" | "recent" | "salary";
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    industries: { value: string; count: number }[];
    skills: { value: string; count: number }[];
  };
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatarUrl?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  resumeId: string;
  resumeFileName: string;
  coverLetter: string;
  status: ApplicationStatus;
  matchScore: number;
  source: string;
  createdAt: string;
  updatedAt: string;
  matchBreakdown?: MatchBreakdown;
}

export interface ApplicationStageEvent {
  id: string;
  applicationId: string;
  from: ApplicationStatus;
  to: ApplicationStatus;
  actorId: string;
  actorName: string;
  note?: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobTitle: string;
  candidateName: string;
  interviewerIds: string[];
  scheduledAt: string;
  durationMin: number;
  format: InterviewFormat;
  participants: string[];
  agenda: string;
  location?: string;
  status: InterviewStatus;
  createdAt: string;
}

export interface Feedback {
  id: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  score: number;
  strengths: string;
  concerns: string;
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  createdAt: string;
}

export interface Note {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  body: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ReportResolution {
  reasonCode: string;
  action: string;
  note: string;
  resolvedById: string;
  resolvedByName: string;
  resolvedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolution?: ReportResolution;
}

export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: "active" | "trialing" | "past_due" | "cancelled";
  features: string[];
  startedAt: string;
  renewsAt: string;
  monthlySeats: number;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  details?: string;
  ipAddress: string;
  createdAt: string;
}

export interface AIProcessingJob {
  id: string;
  type: AIJobType;
  label: string;
  inputRef: string;
  outputRef?: string;
  modelVersion: string;
  status: AIJobStatus;
  error?: string;
  attempts: number;
  createdAt: string;
  completedAt?: string;
}

export interface MatchCriterion {
  label: string;
  category: "skill" | "experience" | "education" | "seniority" | "work_mode" | "location";
  state: MatchCriterionState;
  detail: string;
  weight: number;
}

export interface MatchBreakdown {
  score: number;
  totalWeight: number;
  matchedWeight: number;
  criteria: MatchCriterion[];
  generatedByModel: string;
  generatedAt: string;
}

export interface Recommendation {
  job: Job;
  reason: string;
  matchScore: number;
  dismissed: boolean;
}

export interface JobAnalytics {
  jobId: string;
  jobTitle: string;
  views: number;
  applicationsTotal: number;
  perStage: { stage: ApplicationStatus; count: number }[];
  conversion: { label: string; from: number; to: number; rate: number }[];
  bySource: { source: string; count: number }[];
  avgResponseTimeHours: number;
  timeInStageDays: { stage: ApplicationStatus; medianDays: number }[];
  trend: { date: string; applications: number; views: number }[];
}

export interface AdminOverview {
  signupsToday: number;
  signupsWeek: number;
  activeJobs: number;
  pendingJobs: number;
  applicationsTotal: number;
  applicationsToday: number;
  moderationQueue: number;
  failedProcessing: number;
  openReports: number;
  signupTrend: { date: string; count: number }[];
  applicationsTrend: { date: string; count: number }[];
  processingHealth: { total: number; succeeded: number; failed: number; dead: number };
}

export interface SystemJob extends AIProcessingJob {
  queue: string;
}
