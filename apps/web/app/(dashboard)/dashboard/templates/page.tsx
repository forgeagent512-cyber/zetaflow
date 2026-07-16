"use client";

import { PageTransition } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Manage your workflow templates.</p>
        </div>
        <Card className="glass">
          <CardContent className="py-12 text-center text-muted-foreground">
            Content coming soon.
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
