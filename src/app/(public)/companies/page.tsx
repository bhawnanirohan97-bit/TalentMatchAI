import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { COMPANIES } from "@/lib/mock/companies";
import { CompanyLogo } from "@/components/shared/company-logo";
import { BadgeCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse companies hiring on TalentMatch AI.",
};

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const companies = COMPANIES.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Companies hiring</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companies.length} compan{companies.length === 1 ? "y" : "ies"} · verified employers and beyond
          </p>
        </div>
        <form action="/companies" className="relative" role="search">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search companies…"
            className="h-10 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search companies"
          />
        </form>
      </div>

      {companies.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No companies match “{q}”.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="group flex flex-col rounded-lg border bg-background p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <CompanyLogo name={company.name} size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate font-semibold">
                    {company.name}
                    {company.verified && <BadgeCheck className="size-4 shrink-0 text-emerald-500" aria-label="Verified" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{company.industry} · {company.sizeRange}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{company.description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {company.locations.slice(0, 2).join(", ")}{company.locations.length > 2 ? "…" : ""}
                </span>
                <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {company.jobCount} open role{company.jobCount === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
