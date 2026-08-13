"use client";

import { Bell, Bookmark, LayoutDashboard, ListChecks, Sparkles, UserRound, FileText, ShieldCheck } from "lucide-react";
import { WorkspaceShell, type NavItem } from "@/components/layout/workspace-shell";
import { RequireAuth } from "@/components/layout/require-auth";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/candidate", icon: LayoutDashboard, match: (p) => p === "/candidate" },
  { label: "Applications", href: "/candidate/applications", icon: ListChecks, section: "My activity" },
  { label: "Recommendations", href: "/candidate/recommendations", icon: Sparkles, section: "My activity" },
  { label: "Saved jobs", href: "/candidate/saved", icon: Bookmark, section: "My activity" },
  { label: "Resumes", href: "/candidate/resumes", icon: FileText, section: "Account" },
  { label: "Profile", href: "/candidate/profile", icon: UserRound, section: "Account" },
  { label: "Notifications", href: "/candidate/notifications", icon: Bell, section: "Account", badgeKey: "unread" },
  { label: "Privacy", href: "/candidate/privacy", icon: ShieldCheck, section: "Account" },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["candidate"]}>
      <WorkspaceShell title="Candidate workspace" workspace="candidate" navItems={navItems}>
        {children}
      </WorkspaceShell>
    </RequireAuth>
  );
}
