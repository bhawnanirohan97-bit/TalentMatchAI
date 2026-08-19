"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerDemo } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/session";
import { ROLE } from "@/domain/enums";
import { WORKSPACE_HOME } from "@/domain/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SignupView() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLE.CANDIDATE });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await registerDemo(form.name, form.email, form.password, form.role);
      signIn(session.user, session.roles);
      toast.success("Account created — welcome!");
      router.push(WORKSPACE_HOME[form.role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="space-y-1">
          <Link
            href="/login"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to sign in
          </Link>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start as a candidate to apply and see explainable AI matches.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jordan Smith"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              className="h-10"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">I&apos;m joining as</Label>
            <RadioGroup
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}
              className="grid grid-cols-2 gap-2"
            >
              {[ROLE.CANDIDATE, ROLE.RECRUITER].map((role) => (
                <label
                  key={role}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/50"
                >
                  <RadioGroupItem value={role} id={`role-${role}`} />
                  <span className="capitalize">{role.replace("_", " ")}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
