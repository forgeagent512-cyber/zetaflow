"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Bot,
  Workflow,
  Rocket,
  ArrowRight,
  Activity,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, AnimatedSection, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/feedback";
import { ErrorState } from "@/components/feedback";
import { EmptyState } from "@/components/feedback";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Active Projects", value: "12", change: "+2", trend: "up", icon: Activity },
  { label: "AI Employees", value: "48", change: "+8", trend: "up", icon: Users },
  { label: "Active Agents", value: "24", change: "+3", trend: "up", icon: Bot },
  { label: "Automations", value: "156", change: "+23", trend: "up", icon: Workflow },
  { label: "Deployments", value: "7", change: "+1", trend: "up", icon: Rocket },
  { label: "Tasks Today", value: "1,247", change: "+12%", trend: "up", icon: Activity },
];

const recentActivity = [
  { action: "Deployment completed", project: "Customer Support AI", time: "2 min ago", status: "success" },
  { action: "Agent training started", project: "Lead Qualification", time: "15 min ago", status: "in-progress" },
  { action: "Automation triggered", project: "Email Follow-up", time: "1 hour ago", status: "success" },
  { action: "Billing invoice generated", project: "Enterprise Plan", time: "3 hours ago", status: "pending" },
];

const quickActions = [
  { label: "New Project", icon: Plus, href: "/dashboard/projects" },
  { label: "Add Employee", icon: Users, href: "/dashboard/employees" },
  { label: "Create Agent", icon: Bot, href: "/dashboard/agents" },
  { label: "New Automation", icon: Workflow, href: "/dashboard/automations" },
];

export default function DashboardPage() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title={`${greeting}, welcome back`}
          description="Here's what's happening with your AI workforce today."
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <Card className="glass hover:bg-white/5 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className={cn(
                        "flex items-center text-xs font-medium",
                        stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                      )}>
                        {stat.trend === "up" ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full mt-0.5",
                      item.status === "success" && "bg-emerald-500/10",
                      item.status === "in-progress" && "bg-blue-500/10",
                      item.status === "pending" && "bg-amber-500/10"
                    )}>
                      {item.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {item.status === "in-progress" && <Clock className="h-4 w-4 text-blue-500" />}
                      {item.status === "pending" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.project} · {item.time}</p>
                    </div>
                    <Badge variant={item.status === "success" ? "success" : item.status === "in-progress" ? "default" : "warning"} className="shrink-0">
                      {item.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={action.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

