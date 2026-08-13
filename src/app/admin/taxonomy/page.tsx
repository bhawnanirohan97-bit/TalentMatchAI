"use client";

import { Boxes, Hash, Link2 } from "lucide-react";
import { TAXONOMIES } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminTaxonomyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Boxes className="size-5 text-primary" aria-hidden />
            Taxonomies
          </span>
        }
        description="Canonical terms that power matching, search, and normalization."
      />

      <Tabs defaultValue={TAXONOMIES[0].id}>
        <TabsList className="flex-wrap">
          {TAXONOMIES.map((tax) => (
            <TabsTrigger key={tax.id} value={tax.id}>{tax.name}</TabsTrigger>
          ))}
        </TabsList>

        {TAXONOMIES.map((tax) => (
          <TabsContent key={tax.id} value={tax.id} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{tax.name}</span>
                  <Badge variant="outline"><Hash className="size-3" aria-hidden /> {tax.count} terms</Badge>
                </CardTitle>
                <CardDescription>{tax.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tax.entries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{entry.label}</p>
                        <Badge variant={entry.status === "active" ? "secondary" : "outline"}>{entry.status}</Badge>
                      </div>
                      {entry.aliases.length > 0 && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Link2 className="size-3 shrink-0" aria-hidden />
                          {entry.aliases.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
