"use client";

import { PageTransition } from "@/components/animations";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function AnalyticsCenterPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Analytics Center"
          description="Platform-wide analytics and insights."
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Analytics Center" },
          ]}
        />
        <Card className="glass">
          <CardContent className="py-12 text-center text-muted-foreground">
            Content coming soon.
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}