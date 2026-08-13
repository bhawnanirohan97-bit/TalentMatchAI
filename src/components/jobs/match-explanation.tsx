"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BadgeCheck, Check, Minus, RefreshCw, ShieldAlert, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Job } from "@/domain/types";
import { useAuth } from "@/lib/auth/session";
import { getCandidateProfile, submitMatchFeedback } from "@/lib/api/candidates";
import { computeMatch } from "@/lib/match/engine";
import { MatchRing } from "@/components/shared/match-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATE_META = {
  matched: { label: "Matched", icon: Check, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900" },
  missing: { label: "Missing", icon: Minus, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900" },
  uncertain: { label: "Uncertain", icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900" },
} as const;

export function MatchExplanation({ job }: { job: Job }) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getCandidateProfile(user?.id ?? ""),
    enabled: isAuthenticated && hasRole("candidate") && Boolean(user?.id),
  });

  const breakdown = profile ? computeMatch(profile, job) : undefined;
  const isCandidate = isAuthenticated && hasRole("candidate");

  return (
    <section aria-labelledby="match-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="match-heading" className="text-lg font-semibold">How well do you match?</h2>
        {breakdown && (
          <Badge variant="outline" className="gap-1.5 font-mono text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" aria-hidden />
            Assistive estimate · not a hiring decision
          </Badge>
        )}
      </div>

      {!isCandidate ? (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <BadgeCheck className="size-8 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">See your personal match explanation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in as a candidate to view matched, missing, and uncertain criteria before you apply.
              </p>
            </div>
            <Button asChild><Link href="/login">Sign in to view your match</Link></Button>
          </CardContent>
        </Card>
      ) : !breakdown ? (
        <Card className="mt-4">
          <CardContent className="p-8 text-center">
            <p className="font-semibold">Complete your profile first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We need a few details to generate an explainable match score.
            </p>
            <Button asChild className="mt-4"><Link href="/candidate/profile">Complete profile</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                <MatchRing score={breakdown.score} size={84} stroke={7} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    Score based on <span className="font-medium text-foreground">{breakdown.criteria.length} criteria</span>.
                    Review each criterion below — you can correct your profile or report an inaccurate result.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400"><Check className="size-3" aria-hidden /> Matched</Badge>
                    <Badge variant="outline" className="gap-1 text-rose-600 dark:text-rose-400"><Minus className="size-3" aria-hidden /> Missing</Badge>
                    <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400"><AlertCircle className="size-3" aria-hidden /> Uncertain</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/candidate/profile"><RefreshCw className="mr-2 size-3.5" aria-hidden /> Correct profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ul className="mt-4 space-y-2">
            {breakdown.criteria.map((c) => {
              const meta = STATE_META[c.state];
              const Icon = meta.icon;
              return (
                <li key={c.label} className={cn("flex items-start gap-3 rounded-lg border p-4", meta.bg)}>
                  <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background", meta.color)}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{c.label}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold", meta.color)}>{meta.label}</span>
                        <span className="text-xs text-muted-foreground">weight {c.weight}</span>
                      </div>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Was this match explanation useful?</p>
            <div className="flex gap-2">
              <Button
                variant={feedback === "helpful" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFeedback("helpful");
                  toast.success("Thanks — feedback recorded");
                  submitMatchFeedback({ jobId: job.id, rating: "helpful" });
                }}
              >
                <ThumbsUp className="mr-1.5 size-3.5" aria-hidden /> Helpful
              </Button>
              <Button
                variant={feedback === "not_helpful" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFeedback("not_helpful");
                  toast.success("Thanks — we'll use this to improve");
                  submitMatchFeedback({ jobId: job.id, rating: "not_helpful" });
                }}
              >
                <ThumbsDown className="mr-1.5 size-3.5" aria-hidden /> Not helpful
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
