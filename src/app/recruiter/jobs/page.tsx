"use client";

import Link from "next/link";
import { BarChart3, Eye, Pause, Play, Plus, UsersRound, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createJob, listCompanyJobs, setJobStatus } from "@/lib/api/recruiter";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { EMPLOYMENT_TYPE, JOB_STATUS, WORK_MODE } from "@/domain/enums";
import { EXPERIENCE_LEVEL } from "@/domain/enums";

const STATUS_LABEL: Record<string, string> = {
  [JOB_STATUS.DRAFT]: "Draft",
  [JOB_STATUS.ACTIVE]: "Active",
  [JOB_STATUS.PAUSED]: "Paused",
  [JOB_STATUS.CLOSED]: "Closed",
};

export default function RecruiterJobsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", salaryMin: "", salaryMax: "", employmentType: "Full-time", workMode: "Remote", experienceLevel: "Entry level" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => listCompanyJobs("comp-novatech"),
  });

  const jobs = data ?? [];

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setJobStatus(id, status as never),
    onSuccess: () => {
      toast.success("Job status updated");
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const create = useMutation({
    mutationFn: () =>
      createJob({
        companyId: "comp-novatech",
        title: form.title,
        summary: form.summary,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        employmentType: form.employmentType as never,
        workMode: form.workMode as never,
        experienceLevel: form.experienceLevel as never,
      }),
    onSuccess: () => {
      toast.success("Job draft created");
      setOpen(false);
      setForm({ title: "", summary: "", salaryMin: "", salaryMax: "", employmentType: "Full-time", workMode: "Remote", experienceLevel: "Entry level" });
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create job"),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Manage postings, publish drafts, and track applicants per role.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 size-4" aria-hidden /> New job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a job</DialogTitle>
              <DialogDescription>Start a draft — publish it when the details are ready.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job title</Label>
                <Input id="job-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Developer (React)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-summary">Summary</Label>
                <Textarea id="job-summary" rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="salary-min">Salary min</Label>
                  <Input id="salary-min" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">Salary max</Label>
                  <Input id="salary-max" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(EMPLOYMENT_TYPE).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work mode</Label>
                  <Select value={form.workMode} onValueChange={(v) => setForm({ ...form, workMode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(WORK_MODE).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={form.experienceLevel} onValueChange={(v) => setForm({ ...form, experienceLevel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(EXPERIENCE_LEVEL).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}><X className="mr-2 size-4" aria-hidden /> Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={!form.title.trim() || create.isPending}>Create draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="inbox" title="No jobs yet" description="Create your first posting to start receiving applicants." />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/recruiter/jobs/${job.id}`} className="font-semibold hover:text-primary hover:underline">{job.title}</Link>
                  <Badge variant={job.status === JOB_STATUS.ACTIVE ? "default" : "outline"}>{STATUS_LABEL[job.status]}</Badge>
                  {job.isFeatured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {job.workMode} · {job.employmentType} · {job.experienceLevel} · posted {timeAgo(job.postedAt)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><UsersRound className="size-4" aria-hidden /> {job.applicationsCount}</span>
                <span className="inline-flex items-center gap-1.5"><Eye className="size-4" aria-hidden /> {job.applicationsCount * 8}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {job.status === JOB_STATUS.DRAFT && (
                  <Button size="sm" onClick={() => setStatus.mutate({ id: job.id, status: JOB_STATUS.ACTIVE })}>
                    <Play className="mr-1.5 size-3.5" aria-hidden /> Publish
                  </Button>
                )}
                {job.status === JOB_STATUS.ACTIVE && (
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: job.id, status: JOB_STATUS.PAUSED })}>
                    <Pause className="mr-1.5 size-3.5" aria-hidden /> Pause
                  </Button>
                )}
                {job.status === JOB_STATUS.PAUSED && (
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: job.id, status: JOB_STATUS.ACTIVE })}>
                    <Play className="mr-1.5 size-3.5" aria-hidden /> Resume
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/recruiter/jobs/${job.id}`}><BarChart3 className="mr-1.5 size-3.5" aria-hidden /> Analytics</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
