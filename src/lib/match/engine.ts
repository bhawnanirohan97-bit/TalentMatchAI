import { EMPLOYMENT_TYPE, WORK_MODE } from "@/domain/enums";
import type { CandidateProfile, Job, MatchBreakdown, MatchCriterion } from "@/domain/types";
import { clampScore } from "@/lib/utils";

const SKILL_ALIASES: Record<string, string[]> = {
  react: ["react", "react.js", "reactjs"],
  typescript: ["typescript", "ts"],
  javascript: ["javascript", "js", "es6"],
  node: ["node", "node.js", "nodejs"],
  "next.js": ["next", "nextjs"],
  sql: ["sql", "structured query language"],
  postgresql: ["postgresql", "postgres", "psql"],
  aws: ["aws", "amazon web services"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration"],
  html: ["html", "html5"],
  css: ["css", "css3"],
  git: ["git", "version control"],
  testing: ["testing", "test automation", "qa"],
  design: ["design systems", "design"],
  "rest apis": ["rest", "restful", "api"],
};

function normalize(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}

function aliasesFor(term: string): string[] {
  const key = normalize(term);
  const direct = [key];
  const expanded = SKILL_ALIASES[key] ?? [];
  return Array.from(new Set([...direct, ...expanded]));
}

function skillMatch(skill: string, profileSkills: string[]): boolean {
  const profile = new Set(profileSkills.map(normalize));
  return aliasesFor(skill).some((a) => profile.has(a));
}

const LEVEL_ORDER: Record<string, number> = {
  "Entry level": 0,
  Junior: 1,
  "Mid level": 2,
  "Senior level": 3,
  Lead: 4,
};

function seniorityFit(jobLevel: string, profileLevel: string): "matched" | "uncertain" {
  const job = LEVEL_ORDER[jobLevel] ?? 0;
  const prof = LEVEL_ORDER[profileLevel] ?? 0;
  if (job <= prof && prof - job <= 1) return "matched";
  if (job - prof <= 1) return "uncertain";
  return "uncertain";
}

export function computeMatch(profile: CandidateProfile, job: Job): MatchBreakdown {
  const criteria: MatchCriterion[] = [];
  const skills = [...new Set([...profile.skills, ...(profile.summary.match(/[A-Z][A-Za-z+#./-]+/g) ?? [])])];

  for (const skill of job.skillsRequired) {
    const matched = skillMatch(skill, skills);
    criteria.push({
      label: skill,
      category: "skill",
      state: matched ? "matched" : "missing",
      detail: matched
        ? "Found on your profile or resume."
        : "Not found on your profile or resume.",
      weight: 3,
    });
  }

  for (const skill of job.skillsPreferred) {
    const matched = skillMatch(skill, skills);
    criteria.push({
      label: skill,
      category: "skill",
      state: matched ? "matched" : "missing",
      detail: matched
        ? "Found on your profile."
        : "Preferred, not required. Mention it if you have it.",
      weight: 1.5,
    });
  }

  const years = profile.yearsOfExperience ?? 0;
  criteria.push({
    label: `Experience (${years} yrs)`,
    category: "experience",
    state: years >= 1 ? "matched" : "uncertain",
    detail:
      years >= 1
        ? `Your ${years} year${years === 1 ? "" : "s"} of experience meets the entry-level expectation.`
        : "Little or no professional experience yet — internships and projects still count.",
    weight: 2,
  });

  const fit = seniorityFit(job.experienceLevel, profile.experienceLevel);
  criteria.push({
    label: `Seniority (${profile.experienceLevel})`,
    category: "seniority",
    state: fit,
    detail:
      fit === "matched"
        ? `Your level (${profile.experienceLevel}) aligns with this ${job.experienceLevel} role.`
        : `This is a ${job.experienceLevel} role; your level (${profile.experienceLevel}) is close.`,
    weight: 2,
  });

  const remoteOk =
    profile.preferences?.workModes?.includes(WORK_MODE.REMOTE) ?? true;
  if (job.workMode === WORK_MODE.REMOTE) {
    criteria.push({
      label: "Remote work",
      category: "work_mode",
      state: remoteOk ? "matched" : "uncertain",
      detail: remoteOk
        ? "You're open to remote work and this role is fully remote."
        : "This role is fully remote but remote isn't in your preferences.",
      weight: 1,
    });
  }

  const locationOk =
    !profile.location ||
    profile.location === "Remote" ||
    profile.preferences?.openToRelocation === true ||
    (job.locations ?? []).some((l) => l === "Remote") ||
    (job.locations ?? []).some((l) => l === profile.location);
  criteria.push({
    label: `Location (${profile.location})`,
    category: "location",
    state: locationOk ? "matched" : "uncertain",
    detail: locationOk
      ? "Your location or relocation preference is compatible."
      : `This role lists ${(job.locations ?? []).join(", ") || "locations"} — consider updating your location or relocation preference.`,
    weight: 1,
  });

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const matchedWeight = criteria.reduce(
    (sum, c) => sum + (c.state === "matched" ? c.weight : 0),
    0,
  );
  const uncertainWeight = criteria.reduce(
    (sum, c) => sum + (c.state === "uncertain" ? c.weight * 0.5 : 0),
    0,
  );

  const raw = ((matchedWeight + uncertainWeight) / totalWeight) * 100;

  return {
    score: clampScore(raw),
    totalWeight,
    matchedWeight: matchedWeight + uncertainWeight,
    criteria,
    generatedByModel: "deterministic-v1",
    generatedAt: new Date().toISOString(),
  };
}

export function computeRecommendations(
  profile: CandidateProfile,
  jobs: Job[],
): { job: Job; score: number; reason: string }[] {
  return jobs
    .filter((j) => j.status === "active")
    .map((job) => {
      const match = computeMatch(profile, job);
      let reason: string;
      const matched = match.criteria.filter((c) => c.state === "matched").map((c) => c.label);
      const missing = match.criteria.filter((c) => c.state === "missing").map((c) => c.label);
      if (matched.some((s) => job.skillsRequired.some((r) => normalize(r) === normalize(s)))) {
        reason = `Strong skill overlap: ${matched.slice(0, 3).join(", ")}.`;
      } else if (match.score >= 70) {
        reason = `Good overall fit (${match.score}%). Key matches: ${matched.slice(0, 2).join(", ") || "experience"}${missing.length ? `; consider adding ${missing.slice(0, 2).join(", ")}` : ""}.`;
      } else {
        reason = `Partial fit (${match.score}%). Matching: ${matched.slice(0, 2).join(", ") || "base experience"} — ${missing.slice(0, 2).join(", ") || "some criteria"} not found yet.`;
      }
      return { job, score: match.score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export const SAMPLE_CONTRACT_TYPE = EMPLOYMENT_TYPE.FULL_TIME;
