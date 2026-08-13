"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getMyApplications } from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/session";
import { CompanyLogo } from "@/components/shared/company-logo";
import { StageBadge } from "@/components/shared/stage-badge";
import { MatchIndicator } from "@/components/shared/match-indicator";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { APPLICATION_STATUS } from "@/domain/enums";

const FILTERS = ["All", ...Object.values(APPLICATION_STATUS)] as const;

export default function ApplicationsPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["applications", uid],
    queryFn: () => getMyApplications(uid, 1, 50),
    enabled: Boolean(uid),
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((a) => {
      if (status !== "All" && a.status !== status) return false;
      if (query && !`${a.jobTitle} ${a.companyName}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, status, query]);

  return (
    <div className="space-y-6">
      <PageHeader title="My applications" description="Track every application and stage change in one place." />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job or company…"
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
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
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon="search"
            title="No applications match"
            description="Try a different filter, or find your next role."
            action={<Button asChild><Link href="/jobs">Browse jobs</Link></Button>}
          />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/candidate/applications/${app.id}`}
              className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-muted/40"
            >
              <CompanyLogo name={app.companyName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-semibold text-foreground hover:text-primary">{app.jobTitle}</p>
                  <span className="text-sm text-muted-foreground">{app.companyName}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Applied {timeAgo(app.createdAt)} · Updated {timeAgo(app.updatedAt)}
                </p>
              </div>
              <MatchIndicator score={app.matchScore} className="hidden sm:inline-flex" />
              <StageBadge status={app.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
