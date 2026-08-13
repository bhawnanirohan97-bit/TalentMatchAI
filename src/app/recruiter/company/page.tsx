"use client";

import { BadgeCheck, Building2, CalendarClock, Globe, Layers, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveJobs, getCompanyInfo } from "@/lib/api/recruiter";
import { CompanyLogo } from "@/components/shared/company-logo";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";

const MEMBER_ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  recruiter: "Recruiter",
  hiring_manager: "Hiring manager",
  admin: "Admin",
};

export default function RecruiterCompanyPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-company"],
    queryFn: () => getCompanyInfo("comp-novatech"),
  });
  const { data: jobs } = useQuery({ queryKey: ["recruiter-jobs"], queryFn: () => getActiveJobs() });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { company, members } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <CompanyLogo name={company.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
              {company.verified && (
                <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="size-3.5" aria-hidden /> Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{company.industry} · {company.sizeRange} · remote-first</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{company.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-sm">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="font-medium">Industry</p>
                    <p className="text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="font-medium">Size</p>
                    <p className="text-muted-foreground">{company.sizeRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="font-medium">Locations</p>
                    <p className="text-muted-foreground">{company.locations.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="font-medium">Founded</p>
                    <p className="text-muted-foreground">{company.foundedYear}</p>
                  </div>
                </div>
              </div>
              <a href={company.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Globe className="size-4" aria-hidden /> {company.website}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits &amp; culture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{company.culture}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {company.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <BadgeCheck className="size-4 shrink-0 text-primary" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active roles</CardTitle>
              <CardDescription>{jobs?.length ?? 0} currently open</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {(jobs ?? []).map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.applicationsCount} applicants · {job.workMode}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {member.userId.replace("u-", "").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.userId === "u-demo-rec" ? "Marcus Reed" : member.userId === "u-demo-hm" ? "Priya Nair" : "Noah Patel"}</p>
                      <p className="text-xs text-muted-foreground">Joined {formatDateShort(member.joinedAt)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{MEMBER_ROLE_LABEL[member.role] ?? member.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
