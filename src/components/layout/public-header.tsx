"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/session";
import { WORKSPACE_HOME } from "@/domain/constants";

export function PublicHeader() {
  const { isAuthenticated, roles } = useAuth();

  const workspaceHref = isAuthenticated && roles[0] ? WORKSPACE_HOME[roles[0]] : "/login";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <Link href="/jobs" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Find jobs</Link>
          <Link href="/companies" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Companies</Link>
          <Link href="/home/#how-it-works" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">How it works</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/notifications">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="size-4.5" aria-hidden />
                </Button>
              </Link>
              <Button asChild>
                <Link href={workspaceHref}>My workspace</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
