"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DEMO_ACCOUNTS, signInDemo } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/session";
import { WORKSPACE_HOME } from "@/domain/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginRole = "candidate" | "recruiter" | "admin";

const LOGIN_ROLE_LABEL: Record<LoginRole, string> = {
  candidate: "Student",
  recruiter: "Recruiter",
  admin: "Administrator",
};

const ROLE_OPTIONS: {
  key: LoginRole;
  label: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    key: "recruiter",
    label: "Recruiter",
    icon: BriefcaseBusiness,
  },
  {
    key: "candidate",
    label: "Student",
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-[440px] shrink-0 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex xl:w-[520px]">
        <div>
          <Link href="/home" className="inline-flex items-center gap-2 text-sm font-semibold opacity-90">
            <span className="flex size-8 items-center justify-center rounded-md bg-white/15 text-sm font-bold">
              TM
            </span>
            TalentMatch AI
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight xl:text-3xl">
            Connect talent with the right&nbsp;opportunities.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            A recruitment platform built for transparency — structured applications,
            explainable AI matching, and a pipeline you can trust.
          </p>
        </div>

        <div className="space-y-3 text-xs text-primary-foreground/60">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary-foreground/40" />
            Explainable match scoring
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary-foreground/40" />
            Structured applicant pipeline
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary-foreground/40" />
            Privacy-first candidate profiles
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-4 lg:hidden">
          <Link href="/home" className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              TM
            </span>
            TalentMatch AI
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] space-y-8">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Sign in to TalentMatch
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials or use a demo account.
              </p>
            </div>

            {/* Role selector — compact tabs */}
            <div className="flex rounded-md border bg-muted p-0.5">
              {ROLE_OPTIONS.map((option) => {
                const active = role === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setRole(option.key)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <option.icon className="size-3.5" aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Demo quick sign-in */}
            {demo && (
              <button
                type="button"
                onClick={() => handleDemo(demo.id)}
                disabled={loading !== null}
                className="flex w-full items-center gap-3 rounded-md border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50 disabled:opacity-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  {demo.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{demo.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{demo.email}</p>
                </div>
                {loading === demo.id ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                ) : (
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or sign in with email</span>
              </div>
            </div>

            {/* Email / password form */}
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={demo?.email ?? "you@example.com"}
                    className="h-10 pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-10 w-full" disabled={loading !== null}>
                {loading === "form" && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-foreground hover:underline">
                Create one
              </Link>
            </p>

            {/* Admin link */}
            {role !== "admin" && (
              <p className="text-center text-xs text-muted-foreground">
                Platform administrator?{" "}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                >
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Sign in as admin
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
