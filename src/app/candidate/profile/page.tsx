"use client";

import Link from "next/link";
import { Loader2, Plus, Save, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getCandidateProfile, updateCandidateProfile } from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/shared/badges";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { SKILL_SUGGESTIONS } from "@/domain/constants";
import { EXPERIENCE_LEVEL, WORK_MODE } from "@/domain/enums";
import type { CandidateProfile } from "@/domain/types";
import { formatDateShort } from "@/lib/utils";

type FormState = {
  headline: string;
  summary: string;
  location: string;
  workAuthorization: string;
  experienceLevel: string;
  yearsOfExperience: string;
  skills: string[];
  links: { label: string; url: string }[];
  remoteOnly: boolean;
  openToRelocation: boolean;
  desiredRoles: string;
  workModes: string[];
  jobAlertFrequency: string;
};

function fromProfile(profile: CandidateProfile): FormState {
  return {
    headline: profile.headline,
    summary: profile.summary,
    location: profile.location,
    workAuthorization: profile.workAuthorization,
    experienceLevel: profile.experienceLevel,
    yearsOfExperience: String(profile.yearsOfExperience),
    skills: [...profile.skills],
    links: profile.links.map((l) => ({ ...l })),
    remoteOnly: profile.preferences.remoteOnly,
    openToRelocation: profile.preferences.openToRelocation,
    desiredRoles: profile.preferences.desiredRoles.join(", "),
    workModes: [...profile.preferences.workModes],
    jobAlertFrequency: profile.preferences.jobAlertFrequency,
  };
}

function ProfileForm({ profile, uid }: { profile: CandidateProfile; uid: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(() => fromProfile(profile));
  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState({ label: "", url: "" });

  const save = useMutation({
    mutationFn: () =>
      updateCandidateProfile(uid, {
        headline: form.headline,
        summary: form.summary,
        location: form.location,
        workAuthorization: form.workAuthorization,
        experienceLevel: form.experienceLevel as (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL],
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        skills: form.skills,
        links: form.links.filter((l) => l.label.trim() && l.url.trim()),
        preferences: {
          remoteOnly: form.remoteOnly,
          openToRelocation: form.openToRelocation,
          desiredRoles: form.desiredRoles.split(",").map((s) => s.trim()).filter(Boolean),
          workModes: form.workModes as (typeof WORK_MODE)[keyof typeof WORK_MODE][],
          jobAlertFrequency: form.jobAlertFrequency as "realtime" | "daily" | "weekly" | "none",
        },
      }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile", uid] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  function toggleSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill] }));
  }

  function addSkill() {
    const skill = newSkill.trim();
    if (skill && !form.skills.includes(skill)) setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    setNewSkill("");
  }

  function toggleWorkMode(mode: string) {
    setForm((f) => ({ ...f, workModes: f.workModes.includes(mode) ? f.workModes.filter((m) => m !== mode) : [...f.workModes, mode] }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your profile"
        description={`This powers your AI match scores. Updated ${formatDateShort(profile.updatedAt)}.`}
      >
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : <Save className="mr-2 size-4" aria-hidden />}
          Save changes
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>Your headline is the first thing recruiters see.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workAuth">Work authorization</Label>
                <Input id="workAuth" value={form.workAuthorization} onChange={(e) => setForm({ ...form, workAuthorization: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Experience level</Label>
                <Select value={form.experienceLevel} onValueChange={(v) => setForm({ ...form, experienceLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(EXPERIENCE_LEVEL).map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Years of experience</Label>
                <Input id="years" type="number" min={0} value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add skills to improve match accuracy. Start typing to search suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill…"
                list="skill-suggestions"
              />
              <datalist id="skill-suggestions">
                {SKILL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
              <Button type="button" variant="outline" onClick={addSkill}><Plus className="size-4" aria-hidden /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 py-1">
                  {skill}
                  <button aria-label={`Remove ${skill}`} onClick={() => toggleSkill(skill)}>
                    <X className="size-3 opacity-60 hover:opacity-100" aria-hidden />
                  </button>
                </Badge>
              ))}
            </div>
            {form.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
            <div className="flex flex-wrap gap-1.5 border-t pt-4">
              {SKILL_SUGGESTIONS.slice(0, 10).map((s) => (
                <button key={s} onClick={() => toggleSkill(s)} type="button">
                  <SkillBadge className={form.skills.includes(s) ? "border-primary text-primary" : ""}>{s}</SkillBadge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Tell us what you&apos;re looking for so matching can prioritize well.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Desired roles (comma separated)</Label>
              <Input value={form.desiredRoles} onChange={(e) => setForm({ ...form, desiredRoles: e.target.value })} placeholder="Frontend Developer, Full Stack Developer" />
            </div>
            <div className="space-y-2">
              <Label>Work modes</Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(WORK_MODE).map((mode) => (
                  <Button key={mode} type="button" variant={form.workModes.includes(mode) ? "default" : "outline"} size="sm" onClick={() => toggleWorkMode(mode)}>
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job alert frequency</Label>
              <Select value={form.jobAlertFrequency} onValueChange={(v) => setForm({ ...form, jobAlertFrequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    { value: "realtime", label: "Real-time" },
                    { value: "daily", label: "Daily digest" },
                    { value: "weekly", label: "Weekly digest" },
                    { value: "none", label: "None" },
                  ].map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Remote only</p>
                <p className="text-xs text-muted-foreground">Only recommend fully remote roles</p>
              </div>
              <Switch checked={form.remoteOnly} onCheckedChange={(v) => setForm({ ...form, remoteOnly: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Open to relocation</p>
                <p className="text-xs text-muted-foreground">Willing to relocate for the right role</p>
              </div>
              <Switch checked={form.openToRelocation} onCheckedChange={(v) => setForm({ ...form, openToRelocation: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>Portfolio, GitHub, LinkedIn — anything that helps recruiters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} placeholder="Label" />
              <Input value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://…" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => {
              if (newLink.label.trim() && newLink.url.trim()) {
                setForm({ ...form, links: [...form.links, { ...newLink }] });
                setNewLink({ label: "", url: "" });
              }
            }}>
              <Plus className="mr-1.5 size-3.5" aria-hidden /> Add link
            </Button>
            <ul className="space-y-2">
              {form.links.map((link, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{link.label}</p>
                    <a href={link.url} target="_blank" rel="noreferrer" className="truncate text-xs text-muted-foreground hover:text-primary">{link.url}</a>
                  </div>
                  <button onClick={() => setForm({ ...form, links: form.links.filter((_, idx) => idx !== i) })} aria-label="Remove link">
                    <X className="size-4 text-muted-foreground hover:text-destructive" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              <Link href="/candidate/privacy" className="text-primary hover:underline">Learn how your data is used</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => getCandidateProfile(uid),
    enabled: Boolean(uid),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isError || !profile) return <ErrorState onRetry={() => refetch()} />;

  return <ProfileForm key={profile.id} profile={profile} uid={uid} />;
}
