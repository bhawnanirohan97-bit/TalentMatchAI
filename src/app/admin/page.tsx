"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdminOverview } from "@/lib/api/admin";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { StatsBar, StatItem } from "@/components/shared/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.375rem",
  fontSize: "0.8rem",
};

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      <PageHeader title="Platform overview" description="High-level health of TalentMatch AI." />

      <StatsBar>
        <StatItem label="Signups today" value={data.signupsToday} hint={`${data.signupsWeek} this week`} />
        <StatItem label="Active jobs" value={data.activeJobs} hint={`${data.pendingJobs} pending moderation`} />
        <StatItem label="Applications" value={data.applicationsTotal} hint={`${data.applicationsToday} today`} />
        <StatItem label="Open reports" value={data.openReports} hint={`${data.moderationQueue} in queue`} />
      </StatsBar>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signups</CardTitle>
            <CardDescription>New accounts, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.signupTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#signups)" strokeWidth={2} name="Signups" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Daily applications, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.applicationsTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-4 text-muted-foreground" aria-hidden /> AI processing health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" aria-hidden />
              <span className="text-sm text-muted-foreground">Total jobs</span>
              <span className="font-semibold">{data.processingHealth.total}</span>
            </div>
            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400">Succeeded {data.processingHealth.succeeded}</Badge>
            <Badge variant="outline" className="text-rose-600 dark:text-rose-400">Failed {data.processingHealth.failed}</Badge>
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400">Dead letter {data.processingHealth.dead}</Badge>
            <Link href="/admin/ai" className="text-sm text-primary hover:underline">Manage processing →</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
