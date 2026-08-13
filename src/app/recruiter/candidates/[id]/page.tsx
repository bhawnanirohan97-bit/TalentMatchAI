"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarPlus, Mail, MapPin, Plus, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { addFeedback, addNote, getApplicantDetail, moveApplicantStage, scheduleInterview } from "@/lib/api/recruiter";
import { StageBadge } from "@/components/shared/stage-badge";
import { MatchRing } from "@/components/shared/match-ring";
import { SkillBadge } from "@/components/shared/badges";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { INTERVIEW_FORMAT } from "@/domain/enums";
import { PIPELINE_STAGES, TERMINAL_STAGES, STAGE_META } from "@/domain/constants";

const NEXT_STAGES = [...PIPELINE_STAGES, ...TERMINAL_STAGES];

export default function RecruiterApplicantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();

  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState({ score: "5", strengths: "", concerns: "", recommendation: "yes" });
  const [schedOpen, setSchedOpen] = useState(false);
  const [sched, setSched] = useState<{ scheduledAt: string; durationMin: string; format: string; participants: string; agenda: string }>({
    scheduledAt: "",
    durationMin: "60",
    format: INTERVIEW_FORMAT.VIDEO,
    participants: "",
    agenda: "",
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["applicant-detail", id],
    queryFn: () => getApplicantDetail(id),
    enabled: Boolean(id),
  });

  const moveStage = useMutation({
    mutationFn: ({ to }: { to: string }) => moveApplicantStage(id, to as never),
    onSuccess: () => {
      toast.success("Stage updated");
      qc.invalidateQueries({ queryKey: ["applicant-detail", id] });
      qc.invalidateQueries({ queryKey: ["recruiter-applicants"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => addNote(id, note, true),
    onSuccess: () => {
      toast.success("Note added");
      setNote("");
      qc.invalidateQueries({ queryKey: ["applicant-detail", id] });
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: () =>
      addFeedback({
        applicationId: id,
        score: Number(feedback.score),
        strengths: feedback.strengths,
        concerns: feedback.concerns,
        recommendation: feedback.recommendation as never,
      }),
    onSuccess: () => {
      toast.success("Feedback recorded");
      setFeedback({ score: "5", strengths: "", concerns: "", recommendation: "yes" });
      qc.invalidateQueries({ queryKey: ["applicant-detail", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save feedback"),
  });

  const schedule = useMutation({
    mutationFn: () =>
      scheduleInterview({
        applicationId: id,
        scheduledAt: sched.scheduledAt,
        durationMin: Number(sched.durationMin) || 60,
        format: sched.format as never,
        participants: sched.participants.split(",").map((s) => s.trim()).filter(Boolean),
        agenda: sched.agenda,
      }),
    onSuccess: () => {
      toast.success("Interview scheduled");
      setSchedOpen(false);
      qc.invalidateQueries({ queryKey: ["recruiter-interviews"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not schedule"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { application, stageHistory, notes, feedback: feedbacks, matchBreakdown, profile } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiter/candidates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Candidates
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
            {application.candidateName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">{application.candidateName}</h1>
              <StageBadge status={application.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.email ?? application.candidateName.toLowerCase().replace(/\s/g, ".") + "@example.com"}
            </p>
            {profile && (
              <p className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden /> {profile.profile.location}</span>
                <span>{profile.profile.headline}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MatchRing score={application.matchScore} size={64} stroke={6} />
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => setSchedOpen(true)}><CalendarPlus className="mr-1.5 size-3.5" aria-hidden /> Schedule</Button>
              <Button asChild size="sm" variant="outline"><Link href={`/jobs`}>Job: {application.jobTitle}</Link></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Move stage</CardTitle>
          <CardDescription>Advance or reject this candidate — the timeline logs every change.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {NEXT_STAGES.map((stage) => (
              <Button
                key={stage}
                size="sm"
                variant={stage === application.status ? "default" : "outline"}
                onClick={() => stage !== application.status && moveStage.mutate({ to: stage })}
                disabled={moveStage.isPending}
              >
                {STAGE_META[stage].label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.profile.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.profile.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.profile.yearsOfExperience} years · {profile.profile.workAuthorization}
                </p>
                {profile.resume && (
                  <a href="#" className="inline-flex items-center gap-1 text-sm text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                    <Mail className="size-3.5" aria-hidden /> {profile.resume.fileName}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No profile on file.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match explanation</CardTitle>
            <CardDescription>{matchBreakdown.criteria.length} criteria · model {matchBreakdown.generatedByModel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matchBreakdown.criteria.map((c) => (
                <li key={c.label} className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                  <Badge variant="outline" className={c.state === "matched" ? "text-emerald-600 dark:text-emerald-400" : c.state === "missing" ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {c.state}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l border-border pl-5">
              {stageHistory.map((event) => (
                <li key={event.id} className="relative">
                  <span className={`absolute -left-[27px] top-1 size-2.5 rounded-full border-2 border-background ${STAGE_META[event.to].dot}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge status={event.to} />
                    <span className="text-xs text-muted-foreground">{timeAgo(event.createdAt)} · {event.actorName}</span>
                  </div>
                  {event.note && <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note…" onKeyDown={(e) => e.key === "Enter" && note.trim() && addNoteMutation.mutate()} />
              <Button size="icon" onClick={() => note.trim() && addNoteMutation.mutate()} disabled={addNoteMutation.isPending || !note.trim()}>
                <Plus className="size-4" aria-hidden />
              </Button>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border p-3">
                    <p className="text-sm">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.authorName} · {timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedbacks.length > 0 && (
            <ul className="space-y-3">
              {feedbacks.map((f) => (
                <li key={f.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{f.interviewerName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Score {f.score}/10</Badge>
                      <Badge variant={f.recommendation === "strong_yes" ? "default" : "secondary"}>{f.recommendation.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  {f.strengths && <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Strengths:</span> {f.strengths}</p>}
                  {f.concerns && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Concerns:</span> {f.concerns}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fb-score">Score (1–10)</Label>
              <Input id="fb-score" type="number" min={1} max={10} value={feedback.score} onChange={(e) => setFeedback({ ...feedback, score: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select value={feedback.recommendation} onValueChange={(v) => setFeedback({ ...feedback, recommendation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["strong_yes", "yes", "maybe", "no"].map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fb-strengths">Strengths</Label>
              <Textarea id="fb-strengths" rows={2} value={feedback.strengths} onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fb-concerns">Concerns</Label>
              <Textarea id="fb-concerns" rows={2} value={feedback.concerns} onChange={(e) => setFeedback({ ...feedback, concerns: e.target.value })} />
            </div>
          </div>
          <Button onClick={() => addFeedbackMutation.mutate()} disabled={addFeedbackMutation.isPending || Number(feedback.score) < 1 || Number(feedback.score) > 10}>
            <Send className="mr-2 size-4" aria-hidden /> Save feedback
          </Button>
        </CardContent>
      </Card>

      <Dialog open={schedOpen} onOpenChange={setSchedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule interview</DialogTitle>
            <DialogDescription>Send invites to the candidate and interviewers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="when">Date &amp; time</Label>
              <Input id="when" type="datetime-local" value={sched.scheduledAt} onChange={(e) => setSched({ ...sched, scheduledAt: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={sched.format} onValueChange={(v) => setSched({ ...sched, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(INTERVIEW_FORMAT).map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" value={sched.durationMin} onChange={(e) => setSched({ ...sched, durationMin: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Participants (comma separated)</Label>
              <Input id="participants" value={sched.participants} onChange={(e) => setSched({ ...sched, participants: e.target.value })} placeholder="Priya Nair, Owen (Staff Engineer)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea id="agenda" rows={3} value={sched.agenda} onChange={(e) => setSched({ ...sched, agenda: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedOpen(false)}>Cancel</Button>
            <Button onClick={() => schedule.mutate()} disabled={!sched.scheduledAt || schedule.isPending}>
              {schedule.isPending ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
