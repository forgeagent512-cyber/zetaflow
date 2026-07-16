"use client";

import { useState } from "react";
import {
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Database,
  Globe,
  Users,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HealthComponent {
  name: string;
  status: "healthy" | "degraded" | "error";
  value: string;
  unit: string;
  icon: React.ElementType;
}

interface Provider {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: string;
  latency: string;
}

const initialComponents: HealthComponent[] = [
  { name: "CPU", status: "healthy", value: "23", unit: "%", icon: Cpu },
  { name: "RAM", status: "healthy", value: "4.2", unit: "GB / 16 GB", icon: MemoryStick },
  { name: "Disk", status: "healthy", value: "156", unit: "GB / 500 GB", icon: HardDrive },
  { name: "Queue", status: "healthy", value: "0", unit: "messages", icon: Activity },
  { name: "Database", status: "healthy", value: "12", unit: "ms", icon: Database },
  { name: "API", status: "degraded", value: "245", unit: "ms", icon: Globe },
  { name: "Workers", status: "healthy", value: "8", unit: "active", icon: Users },
  { name: "Network", status: "healthy", value: "15", unit: "ms", icon: Wifi },
];

const providers: Provider[] = [
  { name: "OpenAI", status: "operational", uptime: "99.97%", latency: "340ms" },
  { name: "Anthropic", status: "operational", uptime: "99.95%", latency: "420ms" },
  { name: "Google AI", status: "degraded", uptime: "99.82%", latency: "580ms" },
  { name: "Azure", status: "operational", uptime: "99.99%", latency: "45ms" },
  { name: "AWS", status: "operational", uptime: "99.99%", latency: "12ms" },
];

export default function MonitoringPage() {
  const [components, setComponents] = useState(initialComponents);
  const [refreshing, setRefreshing] = useState(false);

  const refreshMetrics = () => {
    setRefreshing(true);
    setTimeout(() => {
      setComponents(components.map((c) => ({
        ...c,
        value: c.name === "CPU" ? Math.floor(Math.random() * 40 + 10).toString() :
               c.name === "RAM" ? (Math.random() * 8 + 2).toFixed(1) :
               c.name === "Disk" ? (Math.floor(Math.random() * 50 + 130)).toString() :
               c.name === "Queue" ? Math.floor(Math.random() * 5).toString() :
               c.name === "Database" ? Math.floor(Math.random() * 20 + 5).toString() :
               c.name === "API" ? Math.floor(Math.random() * 100 + 150).toString() :
               c.name === "Workers" ? Math.floor(Math.random() * 4 + 6).toString() :
               Math.floor(Math.random() * 20 + 5).toString(),
        status: Math.random() > 0.85 ? "degraded" : "healthy" as "healthy" | "degraded" | "error",
      })));
      setRefreshing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive"> = {
      healthy: "success", operational: "success",
      degraded: "warning",
      error: "destructive", outage: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Monitoring Center"
          description="System health and performance monitoring."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Monitoring" }]}
          actions={
            <Button onClick={refreshMetrics} disabled={refreshing} className="gap-2">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          }
        />

        <StaggerWrapper className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {components.map((comp) => {
            const Icon = comp.icon;
            return (
              <StaggerItem key={comp.name}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{comp.name}</CardTitle>
                    {getStatusIcon(comp.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{comp.value}</span>
                      <span className="text-sm text-muted-foreground">{comp.unit}</span>
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
              <CardTitle>System Health</CardTitle>
              <CardDescription>Component status overview.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {components.map((comp) => (
                  <div key={comp.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <comp.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{comp.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{comp.value} {comp.unit}</span>
                      {getStatusBadge(comp.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Provider Health</CardTitle>
              <CardDescription>External AI provider status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {providers.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <span className="text-sm font-medium">{provider.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Uptime: {provider.uptime}</span>
                      <span>Latency: {provider.latency}</span>
                      {getStatusBadge(provider.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
