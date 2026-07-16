"use client";

import { useState } from "react";
import { Plus, Folder, MoreHorizontal, ArrowRight, Clock, Users, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, AnimatedSection, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";

const projects = [
  { id: "1", name: "Customer Support AI", description: "AI-powered customer support automation", status: "active", employees: 8, agents: 3, lastActivity: "2 min ago" },
  { id: "2", name: "Lead Qualification", description: "Automated lead scoring and qualification", status: "active", employees: 5, agents: 2, lastActivity: "15 min ago" },
  { id: "3", name: "Email Follow-up System", description: "Automated email campaign management", status: "active", employees: 3, agents: 1, lastActivity: "1 hour ago" },
  { id: "4", name: "Data Analysis Pipeline", description: "Real-time data processing and analytics", status: "draft", employees: 0, agents: 0, lastActivity: "2 days ago" },
  { id: "5", name: "Social Media Manager", description: "Automated social media content and posting", status: "archived", employees: 2, agents: 1, lastActivity: "1 week ago" },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage your AI workforce projects."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects" },
          ]}
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search projects..."
            onSearch={setSearchQuery}
            className="max-w-sm"
          />
        </div>

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <Card className="glass hover:bg-white/5 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {project.employees} employees
                    </span>
                    <span className="flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5" />
                      {project.agents} agents
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {project.lastActivity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={project.status === "active" ? "success" : project.status === "draft" ? "warning" : "secondary"}>
                      {project.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerWrapper>
      </div>
    </PageTransition>
  );
}
