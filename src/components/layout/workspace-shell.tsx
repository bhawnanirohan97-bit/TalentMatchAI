"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronsUpDown, LogOut, Menu, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/session";
import { DEMO_ACCOUNTS } from "@/lib/api/auth";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "@/domain/constants";
import { useUnreadCount } from "@/hooks/use-notifications";
import { initials } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: string;
  badgeKey?: "unread" | "queue";
  badgeCount?: number;
  match?: (pathname: string) => boolean;
}

function NavList({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  const groups: { label: string | undefined; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.label === item.section) {
      last.items.push(item);
    } else {
      groups.push({ label: item.section, items: [item] });
    }
  }

  return (
    <nav className="flex flex-col" aria-label="Workspace navigation">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p
              className={cn(
                "mb-1 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase",
                gi > 0 ? "mt-5" : "mt-0",
              )}
            >
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute top-1/2 -left-3 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" aria-hidden />
                )}
                <item.icon className={cn("size-4 shrink-0", active ? "text-primary" : "")} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badgeKey === "unread" && item.badgeCount ? (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {item.badgeCount}
                  </span>
                ) : null}
                {item.badgeCount ? (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                    {item.badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  items,
  pathname,
  user,
  roleLabel,
  onNavigate,
  signOut,
  router,
}: {
  items: NavItem[];
  pathname: string;
  user: { name: string; id: string } | null;
  roleLabel: string;
  onNavigate: () => void;
  signOut: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Logo compact />
        <span className="text-sm font-semibold tracking-tight">TalentMatch AI</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <NavList items={items} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="shrink-0 border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60"
            >
              <Avatar className="size-8">
                <AvatarFallback>{user ? initials(user.name) : <UserRound className="size-4" />}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{user?.name ?? "Signed out"}</p>
                <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-64">
            <DropdownMenuLabel>Switch demo account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEMO_ACCOUNTS.map((account) => (
              <DropdownMenuItem
                key={account.id}
                disabled={account.id === user?.id}
                onSelect={() => {
                  signOut();
                  router.push(`/login?account=${account.role}`);
                }}
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">{initials(account.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABEL[account.role]}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                router.push("/login");
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function WorkspaceShell({
  title,
  navItems,
  workspace,
  children,
}: {
  title: string;
  navItems: NavItem[];
  workspace: "candidate" | "recruiter" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: unread = 0 } = useUnreadCount(user?.id);

  const items = navItems.map((item) =>
    item.badgeKey === "unread" ? { ...item, badgeCount: unread } : item,
  );

  const roleLabel = user ? ROLE_LABEL[user.roles[0]] ?? user.roles[0] : "";

  const sidebar = (
    <SidebarContent
      items={items}
      pathname={pathname}
      user={user}
      roleLabel={roleLabel}
      onNavigate={() => setOpen(false)}
      signOut={signOut}
      router={router}
    />
  );

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar lg:block">{sidebar}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="size-4.5" aria-hidden />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-primary ring-2 ring-background" aria-hidden />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {workspace === "candidate" && (
                    <Link href="/candidate/notifications" className="text-xs font-normal text-primary hover:underline">
                      View all
                    </Link>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      You have {unread} unread notification{unread === 1 ? "" : "s"}
                    </span>
                    <span className="text-xs text-muted-foreground">Open the notifications page for details.</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                  <Avatar className="size-7">
                    <AvatarFallback>{user ? initials(user.name) : <UserRound className="size-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/jobs"><UserRound className="size-4" aria-hidden /> Public site</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
