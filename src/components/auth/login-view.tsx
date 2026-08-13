"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DEMO_ACCOUNTS, signInDemo } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/domain/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/lib/utils";

function workspaceFor(role: string): string {
  if (role === "administrator") return "/admin";
  if (role === "recruiter" || role === "hiring_manager") return "/recruiter";
  return "/candidate";
}

export function LoginView({ defaultAccount }: { defaultAccount?: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleDemo(accountId: string) {
    setLoading(accountId);
    try {
      const session = await signInDemo(accountId);
      signIn(session.user, session.roles);
      toast.success(`Signed in as ${session.user.name}`);
      router.push(workspaceFor(session.user.roles[0]));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(null);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("candidate")) return handleDemo("u-demo-cand");
    if (email.includes("recruiter")) return handleDemo("u-demo-rec");
    if (email.includes("hiring")) return handleDemo("u-demo-hm");
    if (email.includes("admin")) return handleDemo("u-demo-admin");
    toast.error("Use one of the demo emails below, or sign up for a new account.");
  }

  const preselected = DEMO_ACCOUNTS.find((a) => a.role === defaultAccount);

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">
          This is a demo build — pick a role account to explore each workspace.
        </p>
      </div>

      {preselected && (
        <p className="mb-6 text-sm text-muted-foreground">
          Try the <span className="font-medium text-foreground">{ROLE_LABEL[preselected.role]}</span> workspace:
        </p>
      )}

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {DEMO_ACCOUNTS.map((account) => (
          <Card
            key={account.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <Avatar className="size-11">
                <AvatarFallback>{initials(account.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ROLE_LABEL[account.role]}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{account.description}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => handleDemo(account.id)}
                disabled={loading !== null}
              >
                {loading === account.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : "Open"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 w-full max-w-md">
        <Tabs defaultValue="signin">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">Email sign in</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign in with email</CardTitle>
                <CardDescription>
                  Demo emails: <code className="rounded bg-muted px-1 text-xs">candidate@demo.talentmatch</code> ·{" "}
                  <code className="rounded bg-muted px-1 text-xs">recruiter@demo.talentmatch</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Sign in <ArrowRight className="ml-2 size-4" aria-hidden />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    <Link href="/signup" className="text-primary hover:underline">New here? Create an account</Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Signing up as a candidate lets you apply, save jobs, and see AI matches.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/signup">
                  <Button className="w-full">
                    <UserRound className="mr-2 size-4" aria-hidden />
                    Go to sign up
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
