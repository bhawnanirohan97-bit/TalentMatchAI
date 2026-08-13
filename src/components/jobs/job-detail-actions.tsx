"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, CheckCircle2, Loader2 } from "lucide-react";
import type { Job } from "@/domain/types";
import { useAuth } from "@/lib/auth/session";
import { saveJob, unsaveJob } from "@/lib/api/jobs";
import { listResumes, submitApplication } from "@/lib/api/candidates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RESUME_STATUS } from "@/domain/enums";

export function JobDetailActions({ job }: { job: Job }) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(job.savedByMe ?? false);
  const [applyOpen, setApplyOpen] = useState(false);

  const isCandidate = isAuthenticated && hasRole("candidate");

  const toggleSave = useMutation({
    mutationFn: () => (saved ? unsaveJob(job.id) : saveJob(job.id, user?.id ?? "")),
    onMutate: () => setSaved((s) => !s),
    onSuccess: () => {
      toast.success(saved ? "Removed from saved jobs" : "Job saved");
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => setSaved((s) => !s),
  });

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <Button
        variant="outline"
        onClick={() => toggleSave.mutate()}
        aria-pressed={saved}
      >
        <Bookmark className={`mr-2 size-4 ${saved ? "fill-primary text-primary" : ""}`} aria-hidden />
        {saved ? "Saved" : "Save job"}
      </Button>
      <Button size="lg" onClick={() => setApplyOpen(true)}>
        Apply now
      </Button>
      <ApplyDialog
        job={job}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        isCandidate={isCandidate}
      />
    </div>
  );
}

function ApplyDialog({
  job,
  open,
  onOpenChange,
  isCandidate,
}: {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCandidate: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const [resumeId, setResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: resumes = [], isPending: resumesLoading } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: () => listResumes(user?.id ?? ""),
    enabled: open && Boolean(user?.id),
  });

  const readyResumes = resumes.filter((r) => r.status === RESUME_STATUS.READY);

  const { data: hasApplied } = useQuery({
    queryKey: ["applied", job.id, user?.id],
    queryFn: async () => {
      const page = await import("@/lib/api/candidates").then((m) => m.getMyApplications(user?.id ?? "", 1, 50));
      return page.items.some((a) => a.jobId === job.id);
    },
    enabled: open && isCandidate,
  });

  const submit = useMutation({
    mutationFn: () =>
      submitApplication({ userId: user?.id ?? "", jobId: job.id, resumeId, coverLetter }),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Application submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setSubmitted(false); setCoverLetter(""); } }}>
      <DialogContent className="sm:max-w-lg">
        {!isCandidate ? (
          <>
            <DialogHeader>
              <DialogTitle>Apply to {job.title}</DialogTitle>
              <DialogDescription>
                You need a candidate account to apply. Sign in with a demo account or create one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button asChild><Link href="/login">Sign in</Link></Button>
              <Button variant="outline" asChild><Link href="/signup">Create account</Link></Button>
            </DialogFooter>
          </>
        ) : submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
                Application submitted
              </DialogTitle>
              <DialogDescription>
                Your application for <span className="font-medium text-foreground">{job.title}</span> at{" "}
                {job.companyName} has been received. Track its progress from your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button onClick={() => { onOpenChange(false); router.push("/candidate/applications"); }}>
                View applications
              </Button>
              <Button variant="outline" onClick={() => { onOpenChange(false); router.push("/jobs"); }}>
                Keep browsing
              </Button>
            </DialogFooter>
          </>
        ) : hasApplied ? (
          <>
            <DialogHeader>
              <DialogTitle>Already applied</DialogTitle>
              <DialogDescription>
                You&apos;ve already submitted an application for this job. Duplicate submissions are blocked.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { onOpenChange(false); router.push("/candidate/applications"); }}>
                View your applications
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply to {job.title}</DialogTitle>
              <DialogDescription>
                {job.companyName} · {job.locations.join(", ")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume</Label>
                {resumesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading resumes…</div>
                ) : readyResumes.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    No processed resumes yet.{" "}
                    <Link href="/candidate/resumes" className="text-primary hover:underline">Upload one</Link>.
                  </div>
                ) : (
                  <Select value={resumeId} onValueChange={setResumeId}>
                    <SelectTrigger id="resume" className="w-full"><SelectValue placeholder="Choose a resume" /></SelectTrigger>
                    <SelectContent>
                      {readyResumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.fileName} {r.isPrimary ? "· Primary" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover">Cover letter <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="cover"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Tell the recruiter why you're a great fit…"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => submit.mutate()}
                disabled={!resumeId || submit.isPending}
              >
                {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Submit application
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
