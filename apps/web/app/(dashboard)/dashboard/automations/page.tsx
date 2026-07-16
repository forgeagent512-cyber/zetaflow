"use client";

import { useState } from "react";
import { Plus, Workflow, MoreHorizontal, Play, Pause, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Card, CardContent } from "@/components/ui/card";

const automations = [
  { id: "1", name: "Lead Capture & Score", trigger: "New lead created", status: "active", runs: 1247, lastRun: "2 min ago" },
  { id: "2", name: "Email Follow-up Sequence", trigger: "Lead not contacted > 24h", status: "active", runs: 892, lastRun: "5 min ago" },
  { id: "3", name: "Customer Support Triage", trigger: "New support ticket", status: "active", runs: 456, lastRun: "1 min ago" },
  { id: "4", name: "Weekly Report Generation", trigger: "Every Monday 9 AM", status: "inactive", runs: 48, lastRun: "3 days ago" },
  { id: "5", name: "Social Media Publishing", trigger: "Content added to queue", status: "draft", runs: 0, lastRun: "\u2014" },
];

export default function AutomationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = automations.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Automations"
          description="Manage your automation workflows."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Automations" },
          ]}
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Automation
            </Button>
          }
        />

        <SearchInput placeholder="Search automations..." onSearch={setSearchQuery} className="max-w-sm" />

        <div className="rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Trigger</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total Runs</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Last Run</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((auto) => (
                <tr key={auto.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{auto.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{auto.trigger}</td>
                  <td className="p-4">
                    <Badge variant={auto.status === "active" ? "success" : auto.status === "inactive" ? "warning" : "secondary"} className="capitalize">
                      {auto.status === "active" && <Play className="mr-1 h-3 w-3" />}
                      {auto.status === "inactive" && <Pause className="mr-1 h-3 w-3" />}
                      {auto.status === "draft" && <AlertCircle className="mr-1 h-3 w-3" />}
                      {auto.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-sm">{auto.runs.toLocaleString()}</td>
                  <td className="p-4 text-right text-sm text-muted-foreground">{auto.lastRun}</td>
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
