"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listApplicants, listCompanyJobs } from "@/lib/api/recruiter";
import { StageBadge } from "@/components/shared/stage-badge";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { STAGE_META, PIPELINE_STAGES, TERMINAL_STAGES } from "@/domain/constants";

const STAGE_FILTERS = ["All", ...PIPELINE_STAGES, ...TERMINAL_STAGES];

export default function CandidatesPage() {
  const [jobId, setJobId] = useState<string>("All");
  const [stage, setStage] = useState<string>("All");
  const [query, setQuery] = useState("");

  const { data: jobs } = useQuery({ queryKey: ["recruiter-jobs"], queryFn: () => listCompanyJobs("comp-novatech") });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-applicants"],
    queryFn: () => listApplicants({ page: 1, pageSize: 100 }),
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((a) => {
      if (jobId !== "All" && a.jobId !== jobId) return false;
      if (stage !== "All" && a.status !== stage) return false;
      if (query && !a.candidateName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, jobId, stage, query]);

  const grouped = useMemo(() => {
    const order = [...PIPELINE_STAGES, ...TERMINAL_STAGES];
    return order
      .map((s) => ({ stage: s, items: filtered.filter((a) => a.status === s) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader title="Candidates" description="All applicants across your roles, grouped by pipeline stage." />

      <div className="flex flex-wrap items-center gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search candidates…" className="max-w-xs" />
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Job" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All jobs</SelectItem>
            {(jobs ?? []).map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            {STAGE_FILTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="No candidates match" description="Adjust filters to see more of the pipeline." />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.stage}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${STAGE_META[group.stage].dot}`} aria-hidden />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{STAGE_META[group.stage].label}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{group.items.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((app) => (
                  <Link key={app.id} href={`/recruiter/candidates/${app.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{app.candidateName}</p>
                            <p className="truncate text-xs text-muted-foreground">{app.jobTitle}</p>
                          </div>
                          <MatchIndicator score={app.matchScore} />
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                          <span className="text-xs text-muted-foreground">Applied {timeAgo(app.createdAt)}</span>
                          <StageBadge status={app.status} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
