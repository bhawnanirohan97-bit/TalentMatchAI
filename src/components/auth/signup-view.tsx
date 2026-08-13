"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerDemo } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/session";
import { ROLE } from "@/domain/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      router.push(form.role === ROLE.CANDIDATE ? "/candidate" : "/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 sm:px-6">
      <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-6" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Start as a candidate to apply and see explainable AI matches.
      </p>

      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jordan Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label>I&apos;m joining as</Label>
              <RadioGroup
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}
              >
                {[ROLE.CANDIDATE, ROLE.RECRUITER].map((role) => (
                  <label key={role} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40">
                    <RadioGroupItem value={role} id={`role-${role}`} />
                    <span className="capitalize">{role.replace("_", " ")}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
