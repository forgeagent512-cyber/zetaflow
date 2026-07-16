"use client";

import { useState } from "react";
import { Rocket, MoreHorizontal, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";

const deployments = [
  { id: "1", name: "Customer Support AI", version: "v2.4.1", environment: "production", status: "running", deployedAt: "2 hours ago" },
  { id: "2", name: "Lead Qualification", version: "v1.8.0", environment: "production", status: "running", deployedAt: "1 day ago" },
  { id: "3", name: "Email System", version: "v3.1.0", environment: "staging", status: "running", deployedAt: "30 min ago" },
  { id: "4", name: "Data Pipeline", version: "v1.2.0", environment: "development", status: "failed", deployedAt: "5 min ago" },
  { id: "5", name: "Social Media Bot", version: "v0.9.0", environment: "production", status: "stopped", deployedAt: "1 week ago" },
];

export default function DeploymentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Deployments"
          description="Monitor and manage your deployments."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deployments" },
          ]}
          actions={
            <Button>
              <Rocket className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          }
        />

        <div className="rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Version</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Environment</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Deployed</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((dep) => (
                <tr key={dep.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{dep.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground font-mono">{dep.version}</td>
                  <td className="p-4">
                    <Badge variant={dep.environment === "production" ? "default" : dep.environment === "staging" ? "secondary" : "outline"}>
                      {dep.environment}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-sm">
                      {dep.status === "running" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      {dep.status === "failed" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
                      {dep.status === "stopped" && <Loader2 className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="capitalize">{dep.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground">{dep.deployedAt}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
