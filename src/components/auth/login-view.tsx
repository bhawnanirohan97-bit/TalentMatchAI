"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DEMO_ACCOUNTS, signInDemo } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/session";
import { WORKSPACE_HOME } from "@/domain/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, initials } from "@/lib/utils";

type LoginRole = "candidate" | "recruiter" | "admin";

const LOGIN_ROLE_LABEL: Record<LoginRole, string> = {
  candidate: "Student",
  recruiter: "Recruiter",
  admin: "Administrator",
};

const ROLE_OPTIONS: {
  key: LoginRole;
  label: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    key: "recruiter",
    label: "Recruiter",
    description: "Post jobs and manage every application.",
    icon: BriefcaseBusiness,
  },
  {
    key: "candidate",
    label: "Student",
    description: "Apply to jobs and track your progress.",
    icon: GraduationCap,
  },
];

function roleFromAccount(account?: string): LoginRole {
  if (account === "recruiter" || account === "hiring_manager") return "recruiter";
  if (account === "administrator") return "admin";
  return "candidate";
}

function demoIdFor(role: LoginRole): string {
  switch (role) {
    case "recruiter":
      return "u-demo-rec";
    case "admin":
      return "u-demo-admin";
    default:
      return "u-demo-cand";
  }
}

function demoAccountFor(role: LoginRole) {
  return DEMO_ACCOUNTS.find((a) => a.id === demoIdFor(role));
}

export function LoginView({ defaultAccount }: { defaultAccount?: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [role, setRole] = useState<LoginRole>(() => roleFromAccount(defaultAccount));
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const demo = demoAccountFor(role);

  async function handleDemo(accountId: string) {
    setLoading(accountId);
    try {
      const session = await signInDemo(accountId);
      signIn(session.user, session.roles);
      toast.success(`Signed in as ${session.user.name}`);
      router.push(WORKSPACE_HOME[session.user.roles[0]]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(null);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (role === "recruiter" && email.includes("recruiter")) return handleDemo("u-demo-rec");
    if (role === "recruiter" && email.includes("hiring")) return handleDemo("u-demo-hm");
    if (role === "candidate" && email.includes("candidate")) return handleDemo("u-demo-cand");
    if (role === "admin" && email.includes("admin")) return handleDemo("u-demo-admin");
    toast.error(
      demo
        ? `That email doesn't match the ${LOGIN_ROLE_LABEL[role]} account. Try ${demo.email}.`
        : `That email doesn't match the ${LOGIN_ROLE_LABEL[role]} account.`,
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 sm:px-6">
      <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-6" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Choose how you&apos;re signing in to explore TalentMatch.
      </p>

      <div className="mt-8 grid w-full grid-cols-2 gap-3" role="radiogroup" aria-label="Sign in as">
        {ROLE_OPTIONS.map((option) => {
          const active = role === option.key;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setRole(option.key)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-accent/40"
                  : "hover:border-border hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-md",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                <option.icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {role === "admin" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Working as a recruiter or student?{" "}
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className="text-primary hover:underline"
          >
            Pick a role above
          </button>
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Platform administrator?{" "}
          <button
            type="button"
            onClick={() => setRole("admin")}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ShieldCheck className="size-3.5" aria-hidden />
            Continue as demo admin
          </button>
        </p>
      )}

      <Card className="mt-6 w-full">
        <CardHeader>
          <CardTitle>Sign in as {LOGIN_ROLE_LABEL[role]}</CardTitle>
          <CardDescription>Pick the {LOGIN_ROLE_LABEL[role].toLowerCase()} demo account or enter its email below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {demo && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-10">
                <AvatarFallback>{initials(demo.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{demo.name}</p>
                <p className="truncate text-xs text-muted-foreground">{demo.email}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => handleDemo(demo.id)}
                disabled={loading !== null}
              >
                {loading === demo.id ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-1 size-3.5" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" aria-hidden />
            or sign in with email
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={demo?.email ?? "you@example.com"}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading !== null}>
              {loading === "form" && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Sign in
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/signup" className="text-primary hover:underline">
              New here? Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
