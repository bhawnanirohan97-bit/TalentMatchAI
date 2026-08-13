"use client";

import { Building2, CalendarDays, LayoutDashboard, ListChecks, UsersRound } from "lucide-react";
import { WorkspaceShell, type NavItem } from "@/components/layout/workspace-shell";
import { RequireAuth } from "@/components/layout/require-auth";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard, match: (p) => p === "/recruiter" },
  { label: "Jobs", href: "/recruiter/jobs", icon: ListChecks, section: "Manage" },
  { label: "Candidates", href: "/recruiter/candidates", icon: UsersRound, section: "Manage" },
  { label: "Interviews", href: "/recruiter/interviews", icon: CalendarDays, section: "Manage" },
  { label: "Company", href: "/recruiter/company", icon: Building2, section: "Settings" },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["recruiter", "hiring_manager"]}>
      <WorkspaceShell title="Recruiter workspace" workspace="recruiter" navItems={navItems}>
        {children}
      </WorkspaceShell>
    </RequireAuth>
  );
}
