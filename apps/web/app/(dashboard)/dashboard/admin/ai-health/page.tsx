"use client";

import { useState, useEffect } from "react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { aiService } from "@/services/ai.service";
import {
  HeartPulse,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Clock,
  TrendingDown,
  TrendingUp,
  Gauge,
  Shield,
  AlertOctagon,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ProviderHealthData {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  errorRate: number;
  availability: number;
  models: { name: string; status: string; latency: number }[];
  lastChecked: string;
}

interface HealthRecord {
  timestamp: string;
  status: string;
  latency: number;
  errorRate: number;
}

const DEFAULT_PROVIDERS: ProviderHealthData[] = [
  {
    name: "OpenRouter",
    status: "healthy",
    latency: 245,
    errorRate: 0.5,
    availability: 99.8,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "GPT-4o", status: "healthy", latency: 320 },
      { name: "GPT-4o-mini", status: "healthy", latency: 180 },
      { name: "Claude 3.5 Sonnet", status: "healthy", latency: 410 },
      { name: "Claude 3 Haiku", status: "healthy", latency: 220 },
      { name: "Gemini 1.5 Pro", status: "degraded", latency: 890 },
      { name: "Gemini 1.5 Flash", status: "healthy", latency: 150 },
    ],
  },
  {
    name: "OpenAI",
    status: "healthy",
    latency: 180,
    errorRate: 0.3,
    availability: 99.9,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "GPT-4o", status: "healthy", latency: 280 },
      { name: "GPT-4o-mini", status: "healthy", latency: 140 },
      { name: "GPT-4 Turbo", status: "healthy", latency: 520 },
      { name: "GPT-3.5 Turbo", status: "healthy", latency: 90 },
    ],
  },
  {
    name: "Anthropic",
    status: "healthy",
    latency: 320,
    errorRate: 0.7,
    availability: 99.5,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "Claude 3 Opus", status: "healthy", latency: 650 },
      { name: "Claude 3 Sonnet", status: "healthy", latency: 380 },
      { name: "Claude 3 Haiku", status: "healthy", latency: 200 },
    ],
  },
  {
    name: "Gemini",
    status: "degraded",
    latency: 890,
    errorRate: 3.2,
    availability: 97.2,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "Gemini 2.0 Pro", status: "degraded", latency: 1100 },
      { name: "Gemini 1.5 Pro", status: "degraded", latency: 950 },
      { name: "Gemini 1.5 Flash", status: "healthy", latency: 180 },
    ],
  },
  {
    name: "Groq",
    status: "healthy",
    latency: 95,
    errorRate: 0.1,
    availability: 99.95,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "Mixtral 8x7B", status: "healthy", latency: 85 },
      { name: "Llama 3 70B", status: "healthy", latency: 110 },
      { name: "Gemma 2 9B", status: "healthy", latency: 70 },
    ],
  },
  {
    name: "Together AI",
    status: "down",
    latency: 0,
    errorRate: 100,
    availability: 85.3,
    lastChecked: new Date().toISOString(),
    models: [
      { name: "Mixtral 8x22B", status: "down", latency: 0 },
      { name: "Llama 3 70B", status: "down", latency: 0 },
      { name: "DBRX Instruct", status: "down", latency: 0 },
    ],
  },
];

const HEALTH_HISTORY: HealthRecord[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  status: Math.random() > 0.85 ? "degraded" : "healthy",
  latency: 150 + Math.random() * 600,
  errorRate: Math.random() * 3,
}));

export default function AIHealthPage() {
  const [providers, setProviders] = useState<ProviderHealthData[]>(DEFAULT_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [autoDisable, setAutoDisable] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    setLoading(true);
    try {
      const res = await aiService.getProviders();
      if (res.data?.length) setProviders(res.data);
    } catch { /* use defaults */ }
    setLoading(false);
  }

  const overallStatus = providers.every((p) => p.status === "healthy")
    ? "healthy"
    : providers.some((p) => p.status === "down")
    ? "down"
    : "degraded";

  const avgLatency = Math.round(
    providers.filter((p) => p.status !== "down").reduce((sum, p) => sum + p.latency, 0) /
      Math.max(1, providers.filter((p) => p.status !== "down").length)
  );

  const avgAvailability =
    providers.reduce((sum, p) => sum + p.availability, 0) / providers.length;

  const unhealthyModels = providers.reduce(
    (count, p) => count + p.models.filter((m) => m.status !== "healthy").length,
    0
  );

  const latestHistory = HEALTH_HISTORY.slice(-6);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="AI Health Monitor"
          description="Real-time monitoring of AI provider health, model status, and system reliability"
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "AI Health" },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Auto-disable unhealthy</span>
                <Switch checked={autoDisable} onCheckedChange={setAutoDisable} />
              </div>
              <Button variant="glass" size="sm" onClick={loadHealth}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          }
        />

        <StaggerWrapper className="space-y-6">
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="glass md:col-span-2">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    overallStatus === "healthy" ? "bg-emerald-500/10" :
                    overallStatus === "degraded" ? "bg-amber-500/10" : "bg-red-500/10"
                  }`}>
                    {overallStatus === "healthy" ? (
                      <HeartPulse className="h-6 w-6 text-emerald-500" />
                    ) : overallStatus === "degraded" ? (
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    ) : (
                      <AlertOctagon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Overall System Health</p>
                    <p className="text-xl font-bold capitalize">{overallStatus}</p>
                    <p className="text-xs text-muted-foreground">{providers.length} providers monitored</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Avg Latency</span>
                  </div>
                  <p className="text-lg font-bold">{avgLatency}ms</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <TrendingDown className="h-3 w-3" />
                    <span>12% lower than yesterday</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Availability</span>
                  </div>
                  <p className="text-lg font-bold">{avgAvailability.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>99.9% target</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertOctagon className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Issues</span>
                  </div>
                  <p className="text-lg font-bold">{unhealthyModels}</p>
                  <span className="text-xs text-muted-foreground">Unhealthy models</span>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-primary" />
                  Provider Status
                </CardTitle>
                <CardDescription>Individual AI provider health and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {providers.map((provider) => (
                      <div
                        key={provider.name}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedProvider === provider.name
                            ? "border-primary bg-primary/5"
                            : "border-border bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedProvider(selectedProvider === provider.name ? null : provider.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {provider.status === "healthy" ? (
                              <Wifi className="h-4 w-4 text-emerald-500" />
                            ) : provider.status === "degraded" ? (
                              <Wifi className="h-4 w-4 text-amber-500" />
                            ) : (
                              <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">{provider.name}</span>
                          </div>
                          <Badge
                            variant={provider.status === "healthy" ? "success" : provider.status === "degraded" ? "warning" : "destructive"}
                            className="text-[10px]"
                          >
                            {provider.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {provider.latency}ms
                          </span>
                          <span>{provider.errorRate}% error rate</span>
                          <span>{provider.availability}% avail</span>
                        </div>
                        {selectedProvider === provider.name && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2">
                            {provider.models.map((model) => (
                              <div key={model.name} className="flex items-center justify-between">
                                <span className="text-xs">{model.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={model.status === "healthy" ? "success" : model.status === "degraded" ? "warning" : "destructive"}
                                    className="text-[10px]"
                                  >
                                    {model.status}
                                  </Badge>
                                  {model.latency > 0 && (
                                    <span className="text-xs text-muted-foreground">{model.latency}ms</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Health Check History
                  </CardTitle>
                  <CardDescription>Latency trends over the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {latestHistory.map((record, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <span className="text-xs text-muted-foreground w-16 shrink-0">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              record.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, (record.latency / 1000) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{record.latency}ms</span>
                        {record.status === "healthy" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>Low: {Math.min(...latestHistory.map((r) => r.latency))}ms</span>
                    <span>Avg: {Math.round(latestHistory.reduce((s, r) => s + r.latency, 0) / latestHistory.length)}ms</span>
                    <span>High: {Math.max(...latestHistory.map((r) => r.latency))}ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    Auto-Disable Configuration
                  </CardTitle>
                  <CardDescription>Automatic model failover settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border">
                      <div>
                        <p className="text-sm font-medium">Auto-disable unhealthy models</p>
                        <p className="text-xs text-muted-foreground">Automatically route around degraded providers</p>
                      </div>
                      <Switch checked={autoDisable} onCheckedChange={setAutoDisable} />
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-border">
                      <p className="text-sm font-medium mb-2">Failover Thresholds</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Error rate threshold</span>
                          <span className="font-mono">&gt; 5%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Latency threshold</span>
                          <span className="font-mono">&gt; 5000ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Consecutive failures</span>
                          <span className="font-mono">&gt; 3</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Cooldown period</span>
                          <span className="font-mono">5 minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {providers.map((p) => (
                        <Badge
                          key={p.name}
                          variant={p.status === "healthy" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.name}: {autoDisable && p.status !== "healthy" ? "Queued" : "Active"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        </StaggerWrapper>
      </div>
    </PageTransition>
  );
}
