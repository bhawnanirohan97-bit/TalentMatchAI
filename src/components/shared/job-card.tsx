"use client";

import Link from "next/link";
import { Bookmark, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Job } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/shared/company-logo";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { SkillBadge } from "@/components/shared/badges";
import { saveJob, unsaveJob } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/session";
import { formatSalary, timeAgo } from "@/lib/utils";

export function JobCard({
  job,
  matchScore,
  showMatch = false,
  matchReason,
}: {
  job: Job;
  matchScore?: number;
  showMatch?: boolean;
  matchReason?: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(job.savedByMe ?? false);

  const toggleSave = useMutation({
    mutationFn: () => (saved ? unsaveJob(job.id) : saveJob(job.id, user?.id ?? "u-demo-cand")),
    onMutate: () => setSaved((s) => !s),
    onSuccess: () => {
      toast.success(saved ? "Removed from saved jobs" : "Job saved");
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => setSaved((s) => !s),
  });

  return (
    <article className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:gap-4">
      <CompanyLogo name={job.companyName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/jobs/${job.slug}`}
                className="text-[15px] font-semibold text-foreground hover:text-primary"
              >
                {job.title}
              </Link>
              {showMatch && matchScore !== undefined && <MatchIndicator score={matchScore} />}
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{job.companyName}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {job.locations.join(", ")}
              </span>
              <span aria-hidden>·</span>
              <span>{job.workMode}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild variant="outline" size="sm">
              <Link href={`/jobs/${job.slug}`}>View</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={saved ? "Remove from saved jobs" : "Save job"}
              onClick={() => toggleSave.mutate()}
            >
              <Bookmark className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} aria-hidden />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{job.employmentType}</span>
          <span className="font-medium text-foreground">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {timeAgo(job.postedAt)}
          </span>
          {job.companyVerified && (
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">Verified</Badge>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{job.summary}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <SkillBadge key={skill}>{skill}</SkillBadge>
          ))}
          {job.skillsRequired.length > 4 && <SkillBadge>+{job.skillsRequired.length - 4}</SkillBadge>}
          {showMatch && matchReason && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
              {matchReason}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
