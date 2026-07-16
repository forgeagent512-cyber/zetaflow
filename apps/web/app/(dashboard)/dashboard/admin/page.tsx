"use client";

import { TrendingUp, Users, Bot, Building, ShoppingCart, DollarSign, Activity, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";

const stats = [
  { label: "Total Organizations", value: "847", change: "+23", icon: Building },
  { label: "Total Users", value: "3,247", change: "+156", icon: Users },
  { label: "Active Deployments", value: "1,892", change: "+47", icon: Activity },
  { label: "Store Installations", value: "12,478", change: "+892", icon: ShoppingCart },
  { label: "MRR", value: "$127,450", change: "+$8,230", icon: DollarSign },
  { label: "Active AI Employees", value: "9,847", change: "+412", icon: Bot },
];

export default function AdminDashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Admin Dashboard"
          description="Platform-wide overview and management."
          breadcrumbs={[{ label: "Admin" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className="text-xs text-emerald-500">{stat.change}</span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Activity chart coming soon.
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Organization list coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}