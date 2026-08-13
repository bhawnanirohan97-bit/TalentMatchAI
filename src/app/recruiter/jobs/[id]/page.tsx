"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Clock3, Eye, UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getJobAnalytics, getJobForEdit } from "@/lib/api/recruiter";
import { StageBadge } from "@/components/shared/stage-badge";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/domain/constants";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.375rem",
  fontSize: "0.8rem",
};

export default function JobAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: job } = useQuery({ queryKey: ["recruiter-job", id], queryFn: () => getJobForEdit(id), enabled: Boolean(id) });
  const { data: analytics, isLoading, isError, refetch } = useQuery({
    queryKey: ["job-analytics", id],
    queryFn: () => getJobAnalytics(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !analytics || !job) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> All jobs
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Building2 className="size-6 text-primary" aria-hidden />
          {analytics.jobTitle}
        </h1>
        <p className="mt-1 text-muted-foreground">Applicant funnel and performance over the last 14 days.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Applications", value: analytics.applicationsTotal, icon: <UsersRound className="size-5" aria-hidden /> },
          { label: "Views", value: analytics.views, icon: <Eye className="size-5" aria-hidden /> },
          { label: "Avg response time", value: `${analytics.avgResponseTimeHours}h`, icon: <Clock3 className="size-5" aria-hidden /> },
          { label: "Conversion (app → interview)", value: "50%", icon: <UsersRound className="size-5" aria-hidden /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applications &amp; views</CardTitle>
            <CardDescription>Daily trend, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="apps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" fill="url(#apps)" strokeWidth={2} name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline distribution</CardTitle>
            <CardDescription>Candidates per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.perStage} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stage funnel</CardTitle>
          <CardDescription>Conversion between stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.conversion.map((step) => (
              <div key={step.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">{step.rate}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current stage counts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = analytics.perStage.find((s) => s.stage === stage)?.count ?? 0;
              if (count === 0) return null;
              return (
                <div key={stage} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <StageBadge status={stage} />
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
