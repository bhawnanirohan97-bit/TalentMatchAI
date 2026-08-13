"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/lib/api/jobs";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPANY_STATUS } from "@/domain/enums";
import { formatDateShort, cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  [COMPANY_STATUS.PENDING]: "Pending review",
  [COMPANY_STATUS.VERIFIED]: "Verified",
  [COMPANY_STATUS.SUSPENDED]: "Suspended",
};

export default function AdminCompaniesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => listCompanies(),
  });

  const companies = data ?? [];
  const pending = companies.filter((c) => c.status === COMPANY_STATUS.PENDING);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description={`${pending.length} awaiting moderation · ${companies.length} total`}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : companies.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState icon="inbox" title="No companies" />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {companies.map((company) => (
            <div
              key={company.id}
              className={cn(
                "flex flex-wrap items-center gap-4 p-4",
                company.status === COMPANY_STATUS.PENDING && "bg-amber-50/40 dark:bg-amber-950/20",
              )}
            >
              <CompanyLogo name={company.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{company.name}</p>
                  <Badge variant={company.status === COMPANY_STATUS.VERIFIED ? "secondary" : company.status === COMPANY_STATUS.PENDING ? "outline" : "destructive"}>
                    {STATUS_LABEL[company.status]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {company.industry} · {company.sizeRange} · {company.locations.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {company.jobCount} jobs · joined {formatDateShort(company.createdAt)}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/companies/${company.slug}`}>View profile</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
