"use client";

import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listSavedJobs, listSavedSearches, deleteSavedSearch } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/session";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateShort } from "@/lib/utils";

export default function SavedPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const { data: savedJobs, isLoading, isError, refetch } = useQuery({
    queryKey: ["saved-jobs", uid],
    queryFn: () => listSavedJobs(uid),
    enabled: Boolean(uid),
  });

  const { data: savedSearches } = useQuery({
    queryKey: ["saved-searches", uid],
    queryFn: () => listSavedSearches(uid),
    enabled: Boolean(uid),
  });

  const removeSearch = useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      toast.success("Saved search removed");
      qc.invalidateQueries({ queryKey: ["saved-searches", uid] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved jobs & searches"
        description="Bookmark roles and save your favorite search filters for one-click reruns."
      />

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Saved jobs ({savedJobs?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="searches">Saved searches ({savedSearches?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !savedJobs || savedJobs.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                icon="inbox"
                title="No saved jobs"
                description="Save jobs while browsing to see them here."
                action={<Button asChild><Link href="/jobs">Browse jobs</Link></Button>}
              />
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {savedJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="searches" className="mt-4">
          {!savedSearches || savedSearches.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                icon="search"
                title="No saved searches"
                description="Save a search from the jobs page to get back to it quickly."
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedSearches.map((search) => (
                <Card key={search.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{search.name}</CardTitle>
                    <CardDescription>Saved {formatDateShort(search.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {search.alertEnabled && (
                        <Badge variant="secondary" className="gap-1"><Bell className="size-3" aria-hidden /> Alerts on</Badge>
                      )}
                      {Object.entries(search.filters).slice(0, 2).map(([key, val]) => (
                        <Badge key={key} variant="outline">{key}: {Array.isArray(val) ? val.join(", ") : val}</Badge>
                      ))}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/jobs">Run</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Delete search" onClick={() => removeSearch.mutate(search.id)}>
                        <Trash2 className="size-4 text-muted-foreground" aria-hidden />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
