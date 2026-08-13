"use client";

import { Boxes, Building2, Cpu, LayoutDashboard, ListChecks, ScrollText, UsersRound } from "lucide-react";
import { WorkspaceShell, type NavItem } from "@/components/layout/workspace-shell";
import { RequireAuth } from "@/components/layout/require-auth";

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, match: (p) => p === "/admin" },
  { label: "Users", href: "/admin/users", icon: UsersRound, section: "Moderation" },
  { label: "Companies", href: "/admin/companies", icon: Building2, section: "Moderation" },
  { label: "Reports", href: "/admin/reports", icon: ListChecks, section: "Moderation" },
  { label: "AI processing", href: "/admin/ai", icon: Cpu, section: "Operations" },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText, section: "Operations" },
  { label: "Taxonomies", href: "/admin/taxonomy", icon: Boxes, section: "Operations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["administrator"]}>
      <WorkspaceShell title="Admin console" workspace="admin" navItems={navItems}>
        {children}
      </WorkspaceShell>
    </RequireAuth>
  );
}
