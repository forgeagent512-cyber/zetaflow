"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, CheckCircle2, AlertTriangle, XCircle,
  Activity, Clock, Zap, ToggleLeft, BarChart3,
  TrendingUp, TrendingDown, RefreshCw, Filter,
  Cpu, Gauge,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const providers = [
  { name: "OpenAI", status: "healthy", latency: "180ms", errorRate: 0.02, uptime: "99.9%", models: 8, color: "text-emerald-500" },
  { name: "Anthropic", status: "healthy", latency: "320ms", errorRate: 0.05, uptime: "99.8%", models: 4, color: "text-violet-500" },
  { name: "Gemini", status: "degraded", latency: "510ms", errorRate: 2.1, uptime: "98.5%", models: 3, color: "text-blue-500" },
  { name: "Groq", status: "healthy", latency: "85ms", errorRate: 0.01, uptime: "99.9%", models: 5, color: "text-amber-500" },
  { name: "OpenRouter", status: "healthy", latency: "210ms", errorRate: 0.08, uptime: "99.7%", models: 12, color: "text-rose-500" },
  { name: "Together AI", status: "healthy", latency: "195ms", errorRate: 0.03, uptime: "99.6%", models: 6, color: "text-cyan-500" },
];

const models = [
  { name: "GPT-4o", provider: "OpenAI", status: "healthy", latency: "210ms", errorRate: 0.01, requests: "1.2M" },
  { name: "GPT-4o-mini", provider: "OpenAI", status: "healthy", latency: "180ms", errorRate: 0.02, requests: "890K" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", status: "healthy", latency: "340ms", errorRate: 0.03, requests: "650K" },
  { name: "Claude 3 Haiku", provider: "Anthropic", status: "healthy", latency: "280ms", errorRate: 0.01, requests: "420K" },
  { name: "Gemini 1.5 Pro", provider: "Gemini", status: "degraded", latency: "520ms", errorRate: 2.1, requests: "310K" },
  { name: "Gemini 1.5 Flash", provider: "Gemini", status: "healthy", latency: "190ms", errorRate: 0.04, requests: "280K" },
  { name: "Llama 3.1 70B", provider: "Groq", status: "healthy", latency: "95ms", errorRate: 0.01, requests: "540K" },
  { name: "Llama 3.1 8B", provider: "Groq", status: "healthy", latency: "45ms", errorRate: 0.01, requests: "450K" },
];

const latencyHistory = [
  { time: "00:00", value: 180 }, { time: "04:00", value: 195 }, { time: "08:00", value: 310 },
  { time: "12:00", value: 290 }, { time: "16:00", value: 210 }, { time: "20:00", value: 175 },
  { time: "Now", value: 180 },
];

export default function ProviderHealthPage() {
  const [autoDisable, setAutoDisable] = useState<Record<string, boolean>>({});

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Provider Health"
          description="Monitor AI provider status, latency, and error rates."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Provider Health" }]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="glass" size="sm" className="gap-1"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
              <Button variant="outline" size="sm" className="gap-1"><Filter className="h-3.5 w-3.5" />Filter</Button>
            </div>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <StaggerItem key={p.name}>
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{p.name}</CardTitle>
                  <Badge variant={p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : "destructive"} className="gap-1">
                    {p.status === "healthy" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {p.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center"><p className="text-lg font-bold">{p.latency}</p><p className="text-[10px] text-muted-foreground">Latency</p></div>
                    <div className="text-center"><p className="text-lg font-bold">{p.errorRate}%</p><p className="text-[10px] text-muted-foreground">Errors</p></div>
                    <div className="text-center"><p className="text-lg font-bold">{p.uptime}</p><p className="text-[10px] text-muted-foreground">Uptime</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{p.models} models</Badge>
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px]">Auto-disable</Label>
                      <Switch checked={autoDisable[p.name] ?? false} onCheckedChange={(v) => setAutoDisable({ ...autoDisable, [p.name]: v })} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Latency Trend</CardTitle>
              <CardDescription>Average latency across providers (ms)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {latencyHistory.map((point) => (
                  <div key={point.time} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex items-end justify-center" style={{ height: "100%" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(point.value / 350) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-4/5 rounded-t bg-gradient-to-t from-primary/60 to-primary"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{point.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
              <CardDescription>Error percentage per provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs w-20 shrink-0">{p.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(p.errorRate * 20, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${p.errorRate > 1 ? "bg-red-500" : p.errorRate > 0.5 ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{p.errorRate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader><CardTitle>Model Health</CardTitle><CardDescription>Detailed health status for all models</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Model</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Provider</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Latency</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Error Rate</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <motion.tr key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 font-medium">{m.name}</td>
                      <td className="py-3 text-muted-foreground text-xs">{m.provider}</td>
                      <td className="py-3">
                        <Badge variant={m.status === "healthy" ? "success" : "warning"} className="gap-1">
                          {m.status === "healthy" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{m.latency}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium ${m.errorRate > 1 ? "text-red-500" : "text-emerald-500"}`}>{m.errorRate}%</span>
                      </td>
                      <td className="py-3 text-muted-foreground">{m.requests}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

