"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { dismissRecommendation, getRecommendations } from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/session";
import { CompanyLogo } from "@/components/shared/company-logo";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { SkillBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/utils";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recommendations", uid],
    queryFn: () => getRecommendations(uid),
    enabled: Boolean(uid),
  });

  const dismiss = useMutation({
    mutationFn: (jobId: string) => dismissRecommendation(jobId),
    onSuccess: () => {
      toast.success("Dismissed from recommendations");
      qc.invalidateQueries({ queryKey: ["recommendations", uid] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recommended for you"
        description="Jobs matched to your profile and preferences."
      />

      <p className="text-sm text-muted-foreground">
        Scores come from your skills, experience, and preferences compared against each job&apos;s requirements.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <div className="rounded-md border bg-card">
          <EmptyState
            icon="inbox"
            title="No recommendations right now"
            description="Complete your profile and we'll surface roles worth your time."
            action={<Button asChild><Link href="/candidate/profile">Complete profile</Link></Button>}
          />
        </div>
      ) : (
        <div className="divide-y rounded-md border bg-card">
          {data.map((rec) => (
            <div key={rec.job.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30">
              <CompanyLogo name={rec.job.companyName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/jobs/${rec.job.slug}`} className="text-sm font-semibold text-foreground hover:text-primary">
                      {rec.job.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{rec.job.companyName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {rec.job.locations.join(", ")} · {rec.job.workMode} · {rec.job.employmentType}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground">
                      {formatSalary(rec.job.salaryMin, rec.job.salaryMax, rec.job.salaryCurrency)}
                    </p>
                  </div>
                  <MatchIndicator score={rec.matchScore} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {rec.job.skillsRequired.slice(0, 5).map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                  {rec.job.skillsRequired.length > 5 && (
                    <SkillBadge>+{rec.job.skillsRequired.length - 5}</SkillBadge>
                  )}
                </div>
                {rec.reason && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{rec.reason}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Not interested"
                onClick={() => dismiss.mutate(rec.job.id)}
                disabled={dismiss.isPending}
              >
                <X className="size-3.5 text-muted-foreground" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
