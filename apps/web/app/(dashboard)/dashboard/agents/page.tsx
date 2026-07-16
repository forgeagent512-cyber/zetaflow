"use client";

import { useState } from "react";
import { Plus, Bot, MoreHorizontal, Play, Square, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";

const agents = [
  { id: "1", name: "Customer Support Bot", type: "chat", status: "running", project: "Customer Support AI", accuracy: 97, lastRun: "2 min ago" },
  { id: "2", name: "Lead Scorer", type: "analysis", status: "running", project: "Lead Qualification", accuracy: 94, lastRun: "5 min ago" },
  { id: "3", name: "Email Composer", type: "workflow", status: "running", project: "Email Follow-up", accuracy: 91, lastRun: "1 hour ago" },
  { id: "4", name: "Data Analyzer", type: "analysis", status: "stopped", project: "Data Analysis", accuracy: 88, lastRun: "1 day ago" },
  { id: "5", name: "Content Generator", type: "generator", status: "error", project: "Social Media", accuracy: 0, lastRun: "3 hours ago" },
];

const statusConfig: Record<string, { variant: "success" | "secondary" | "destructive"; icon: React.ElementType }> = {
  running: { variant: "success", icon: CheckCircle2 },
  stopped: { variant: "secondary", icon: Square },
  error: { variant: "destructive", icon: AlertCircle },
};

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Agents"
          description="Configure and monitor your AI agents."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Agents" },
          ]}
          actions={
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          }
        />

        <SearchInput
          placeholder="Search agents..."
          onSearch={setSearchQuery}
          className="max-w-sm"
        />

        <div className="rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Accuracy</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent) => {
                const config = statusConfig[agent.status];
                const StatusIcon = config?.icon || Clock;
                return (
                  <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">{agent.type}</td>
                    <td className="p-4 text-sm text-muted-foreground">{agent.project}</td>
                    <td className="p-4">
                      <Badge variant={config?.variant || "secondary"} className="capitalize">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {agent.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-sm">{agent.accuracy > 0 ? `${agent.accuracy}%` : "\u2014"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
