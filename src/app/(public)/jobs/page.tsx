import type { Metadata } from "next";
import { JobSearchView } from "@/components/jobs/job-search-view";

export const metadata: Metadata = {
  title: "Find jobs",
  description: "Search and filter entry-level tech jobs by skill, location, salary, and more.",
};

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JobSearchView initialParams={params} />
    </div>
  );
}
