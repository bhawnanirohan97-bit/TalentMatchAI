"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listUsers, setUserStatus } from "@/lib/api/admin";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABEL } from "@/domain/constants";
import { USER_STATUS } from "@/domain/enums";
import { initials, formatDateShort } from "@/lib/utils";

const ROLE_COLOR: Record<string, string> = {
  candidate: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  recruiter: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  hiring_manager: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  administrator: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", query, status],
    queryFn: () => listUsers({ query: query || undefined, status: status === "All" ? undefined : (status as never), pageSize: 50 }),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) => setUserStatus(id, to as never),
    onSuccess: () => {
      toast.success("User status updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage accounts across the platform." />

      <div className="flex flex-wrap items-center gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email…" className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {Object.values(USER_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="search" title="No users match" />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {data.items.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center gap-4 p-4">
              <Avatar className="size-10">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  <Badge variant={user.status === USER_STATUS.ACTIVE ? "secondary" : "destructive"}>{user.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user.email} · joined {formatDateShort(user.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <Badge key={role} variant="outline" className={ROLE_COLOR[role] ?? ""}>{ROLE_LABEL[role] ?? role}</Badge>
                ))}
              </div>
              <div className="flex shrink-0 gap-2">
                {user.status === USER_STATUS.ACTIVE ? (
                  <Button size="sm" variant="outline" onClick={() => toggleStatus.mutate({ id: user.id, to: USER_STATUS.SUSPENDED })}>Suspend</Button>
                ) : (
                  <Button size="sm" onClick={() => toggleStatus.mutate({ id: user.id, to: USER_STATUS.ACTIVE })}>Reactivate</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
