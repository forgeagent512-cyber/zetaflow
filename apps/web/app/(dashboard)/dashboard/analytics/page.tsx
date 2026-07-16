"use client";

import { TrendingUp, TrendingDown, Activity, Users, Bot, MessageSquare, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition, AnimatedSection, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const metrics = [
  { label: "Total Conversations", value: "12,847", change: "+18.2%", trend: "up", icon: MessageSquare },
  { label: "Active Users", value: "847", change: "+5.4%", trend: "up", icon: Users },
  { label: "Avg Response Time", value: "1.2s", change: "-12.5%", trend: "up", icon: Clock },
  { label: "Tasks Completed", value: "94.2%", change: "+2.1%", trend: "up", icon: Activity },
  { label: "AI Employees", value: "48", change: "+6", trend: "up", icon: Bot },
  { label: "Cost per Task", value: "$0.012", change: "-8.3%", trend: "up", icon: BarChart3 },
];

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Platform analytics and insights."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics" },
          ]}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <StaggerItem key={metric.label}>
                    <Card className="glass">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className={cn(
                            "flex items-center text-xs font-medium",
                            metric.trend === "up" ? "text-emerald-500" : "text-red-500"
                          )}>
                            {metric.trend === "up" ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
                            {metric.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerWrapper>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader><CardTitle>Performance Over Time</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                    Chart visualization coming soon.
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader><CardTitle>Top Performing Agents</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                    Agent rankings coming soon.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="glass">
              <CardContent className="py-12 text-center text-muted-foreground">
                Employee analytics coming soon.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card className="glass">
              <CardContent className="py-12 text-center text-muted-foreground">
                Usage analytics coming soon.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card className="glass">
              <CardContent className="py-12 text-center text-muted-foreground">
                Cost analytics coming soon.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
