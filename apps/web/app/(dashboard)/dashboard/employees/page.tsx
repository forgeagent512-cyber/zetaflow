"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Mail, Clock, Activity, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageTransition, AnimatedSection, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";

const employees = [
  { id: "1", name: "Sarah Chen", role: "Customer Support Agent", status: "active", email: "sarah@buildagent.io", tasks: 145, efficiency: 98 },
  { id: "2", name: "Marcus Johnson", role: "Lead Qualification Specialist", status: "active", email: "marcus@buildagent.io", tasks: 128, efficiency: 95 },
  { id: "3", name: "Priya Patel", role: "Data Analyst", status: "active", email: "priya@buildagent.io", tasks: 112, efficiency: 92 },
  { id: "4", name: "Alex Kim", role: "Email Campaign Manager", status: "idle", email: "alex@buildagent.io", tasks: 87, efficiency: 88 },
  { id: "5", name: "Jordan Taylor", role: "Social Media Coordinator", status: "active", email: "jordan@buildagent.io", tasks: 73, efficiency: 85 },
  { id: "6", name: "Emma Wilson", role: "Report Generator", status: "error", email: "emma@buildagent.io", tasks: 45, efficiency: 78 },
];

const statusColor: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  idle: "warning",
  error: "destructive",
  offline: "secondary",
};

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="AI Employees"
          description="Manage your AI workforce."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employees" },
          ]}
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          }
        />

        <SearchInput
          placeholder="Search employees..."
          onSearch={setSearchQuery}
          className="max-w-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((employee, i) => (
            <Card key={employee.id} className="glass hover:bg-white/5 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {employee.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{employee.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor[employee.status]} className="capitalize">
                      {employee.status}
                    </Badge>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Tasks
                    </span>
                    <p className="font-medium">{employee.tasks}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Bot className="h-3 w-3" /> Efficiency
                    </span>
                    <p className="font-medium">{employee.efficiency}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
