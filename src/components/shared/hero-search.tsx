"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/jobs?q=${encodeURIComponent(q.trim())}` : "/jobs");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full max-w-xl items-center gap-2 rounded-lg border bg-background p-2 shadow-lg shadow-primary/5 ${className ?? ""}`}
      role="search"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Job title, skill, or company"
          className="border-0 pl-10 shadow-none focus-visible:ring-0"
          aria-label="Search for jobs"
        />
      </div>
      <Button type="submit" className="shrink-0">
        Search jobs
      </Button>
    </form>
  );
}
