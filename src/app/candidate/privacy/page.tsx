"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const sections = [
  {
    title: "What data we use for matching",
    body: "Your profile, resume, and preferences are used to compute explainable match scores against jobs. You can view every criterion behind a score and correct inaccuracies at any time.",
  },
  {
    title: "Who sees your profile",
    body: "Recruiters at companies you apply to can see your full profile and resume. Before you apply, your profile is visible only to you. You control when your information becomes visible.",
  },
  {
    title: "AI and automation",
    body: "Match scores are assistive estimates, never hiring decisions. Humans always review candidates. Our AI parses resumes, extracts skills, and generates recommendations — all visible and auditable in your activity.",
  },
  {
    title: "Data retention & deletion",
    body: "You can delete your resumes at any time and update or close your account from your profile. When you close your account, your personal data is removed within 30 days.",
  },
  {
    title: "Your rights",
    body: "As this is a demo build, no real personal data is transmitted to servers. Everything runs locally in your browser's storage to demonstrate the product experience.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Privacy & data usage" description="Transparency is built into TalentMatch AI — here's how your data works." />

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
