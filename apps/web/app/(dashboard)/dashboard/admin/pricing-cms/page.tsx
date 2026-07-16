"use client";

import { PageTransition } from "@/components/animations";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function PricingCMSPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Pricing CMS"
          description="Manage pricing plans and tiers."
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Pricing CMS" },
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