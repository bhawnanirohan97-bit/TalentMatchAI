"use client";

import Link from "next/link";
import { BarChart3, Eye, Pause, Pencil, Play, Plus, UsersRound, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createJob, listCompanyJobs, setJobStatus, updateJob } from "@/lib/api/recruiter";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EMPTY_JOB_FORM, jobFormFromJob, JobFormFields, type JobFormState } from "@/components/recruiter/job-form-fields";
import { timeAgo } from "@/lib/utils";
import { JOB_STATUS } from "@/domain/enums";
import type { Job } from "@/domain/types";

const STATUS_LABEL: Record<string, string> = {
  [JOB_STATUS.DRAFT]: "Draft",
  [JOB_STATUS.ACTIVE]: "Active",
  [JOB_STATUS.PAUSED]: "Paused",
  [JOB_STATUS.CLOSED]: "Closed",
};

export default function RecruiterJobsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormState>(EMPTY_JOB_FORM);

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
      setEditing(null);
      setForm(EMPTY_JOB_FORM);
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create job"),
  });

  const update = useMutation({
    mutationFn: (jobId: string) =>
      updateJob(jobId, {
        title: form.title,
        summary: form.summary,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        employmentType: form.employmentType as never,
        workMode: form.workMode as never,
        experienceLevel: form.experienceLevel as never,
      }),
    onSuccess: () => {
      toast.success("Job updated");
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_JOB_FORM);
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update job"),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_JOB_FORM);
    setOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    setForm(jobFormFromJob(job));
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Manage postings, publish drafts, and track applicants per role.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 size-4" aria-hidden /> New job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit job" : "Create a job"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the job details and save your changes."
                  : "Start a draft — publish it when the details are ready."}
              </DialogDescription>
            </DialogHeader>
            <JobFormFields form={form} onChange={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}><X className="mr-2 size-4" aria-hidden /> Cancel</Button>
              <Button
                onClick={() => (editing ? update.mutate(editing.id) : create.mutate())}
                disabled={!form.title.trim() || create.isPending || update.isPending}
              >
                {editing ? "Save changes" : "Create draft"}
              </Button>
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
                <Button size="sm" variant="outline" onClick={() => openEdit(job)}>
                  <Pencil className="mr-1.5 size-3.5" aria-hidden /> Edit
                </Button>
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
