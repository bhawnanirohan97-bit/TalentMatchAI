"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYMENT_TYPE, EXPERIENCE_LEVEL, WORK_MODE } from "@/domain/enums";
import type { Job } from "@/domain/types";

export interface JobFormState {
  title: string;
  summary: string;
  salaryMin: string;
  salaryMax: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
}

export const EMPTY_JOB_FORM: JobFormState = {
  title: "",
  summary: "",
  salaryMin: "",
  salaryMax: "",
  employmentType: EMPLOYMENT_TYPE.FULL_TIME,
  workMode: WORK_MODE.REMOTE,
  experienceLevel: EXPERIENCE_LEVEL.ENTRY,
};

export function jobFormFromJob(job: Job): JobFormState {
  return {
    title: job.title,
    summary: job.summary,
    salaryMin: job.salaryMin > 0 ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax > 0 ? String(job.salaryMax) : "",
    employmentType: job.employmentType,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel,
  };
}

export function salaryDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function JobFormFields({
  form,
  onChange,
}: {
  form: JobFormState;
  onChange: (next: JobFormState) => void;
}) {
  const set = <K extends keyof JobFormState>(key: K, value: JobFormState[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-title">Job title</Label>
        <Input
          id="job-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Frontend Developer (React)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-summary">Summary</Label>
        <Textarea
          id="job-summary"
          rows={3}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label>Salary</Label>
          <span className="text-xs text-muted-foreground">₹ INR per annum</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="salary-min" className="text-xs font-normal text-muted-foreground">
              Minimum
            </Label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden
              >
                ₹
              </span>
              <Input
                id="salary-min"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", salaryDigits(e.target.value))}
                placeholder="e.g. 40000"
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary-max" className="text-xs font-normal text-muted-foreground">
              Maximum
            </Label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden
              >
                ₹
              </span>
              <Input
                id="salary-max"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", salaryDigits(e.target.value))}
                placeholder="e.g. 650000"
                className="pl-7"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.employmentType} onValueChange={(v) => set("employmentType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(EMPLOYMENT_TYPE).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Work mode</Label>
          <Select value={form.workMode} onValueChange={(v) => set("workMode", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(WORK_MODE).map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={form.experienceLevel} onValueChange={(v) => set("experienceLevel", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(EXPERIENCE_LEVEL).map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
