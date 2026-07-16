"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingDown,
  BarChart3,
  Cpu,
  Cloud,
  Zap,
  Activity,
  PieChart,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CostItem {
  label: string;
  value: string;
  percentage: number;
  icon: React.ElementType;
  color: string;
}

const modelCosts: CostItem[] = [
  { label: "GPT-4o", value: "$12,450", percentage: 42, icon: Cpu, color: "bg-blue-500" },
  { label: "Claude 3.5", value: "$8,320", percentage: 28, icon: Cpu, color: "bg-purple-500" },
  { label: "Gemini Pro", value: "$4,180", percentage: 14, icon: Cpu, color: "bg-emerald-500" },
  { label: "Open Source", value: "$3,650", percentage: 12, icon: Cpu, color: "bg-amber-500" },
  { label: "Other", value: "$1,200", percentage: 4, icon: Cpu, color: "bg-gray-500" },
];

const providerCosts: CostItem[] = [
  { label: "OpenAI", value: "$12,450", percentage: 42, icon: Cloud, color: "bg-emerald-500" },
  { label: "Anthropic", value: "$8,320", percentage: 28, icon: Cloud, color: "bg-purple-500" },
  { label: "Google", value: "$4,180", percentage: 14, icon: Cloud, color: "bg-blue-500" },
  { label: "Self-Hosted", value: "$3,650", percentage: 12, icon: Cloud, color: "bg-amber-500" },
  { label: "Other", value: "$1,200", percentage: 4, icon: Cloud, color: "bg-gray-500" },
];

const taskCosts: CostItem[] = [
  { label: "Content Generation", value: "$9,840", percentage: 33, icon: Zap, color: "bg-blue-500" },
  { label: "Chat/Conversation", value: "$7,260", percentage: 25, icon: Activity, color: "bg-purple-500" },
  { label: "Analysis", value: "$5,320", percentage: 18, icon: PieChart, color: "bg-emerald-500" },
  { label: "Search/Retrieval", value: "$4,180", percentage: 14, icon: BarChart3, color: "bg-amber-500" },
  { label: "Other", value: "$2,900", percentage: 10, icon: DollarSign, color: "bg-gray-500" },
];

export default function CostOptimizerPage() {
  const [view, setView] = useState<"model" | "provider" | "task">("model");

  const costs = view === "model" ? modelCosts : view === "provider" ? providerCosts : taskCosts;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Cost Optimizer"
          description="Monitor and optimize your AI usage costs."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Cost Optimizer" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Monthly Cost", value: "$29,800", icon: DollarSign, change: "+12%" },
            { label: "Tokens Used", value: "847M", icon: Activity, change: "+8%" },
            { label: "Total Requests", value: "2.4M", icon: BarChart3, change: "+15%" },
            { label: "Avg Cost/Request", value: "$0.0124", icon: TrendingDown, change: "-3%" },
            { label: "Cost Savings", value: "$4,200", icon: DollarSign, change: "This month" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <span className="text-xs text-emerald-500">{stat.change}</span>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Analyze costs by different dimensions.</CardDescription>
              </div>
              <div className="flex gap-2">
                {(["model", "provider", "task"] as const).map((v) => (
                  <Button key={v} variant={view === v ? "default" : "outline"} size="sm" onClick={() => setView(v)}>
                    {v === "model" ? "By Model" : v === "provider" ? "By Provider" : "By Task"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costs.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${item.color.replace("bg-", "text-").replace("/10", "")}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-muted-foreground">Total This Month</p>
                <p className="text-lg font-bold">$29,800</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-muted-foreground">Avg. Daily</p>
                <p className="text-lg font-bold">$993</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-muted-foreground">Projected Monthly</p>
                <p className="text-lg font-bold">$30,783</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Tokens Used", value: "847M", detail: "Input: 520M / Output: 327M" },
                { label: "Requests Made", value: "2.4M", detail: "Avg 80K/day" },
                { label: "Avg Tokens/Request", value: "353", detail: "Input: 217 / Output: 136" },
                { label: "Peak Usage", value: "142K req/hr", detail: "2026-07-01 14:00 UTC" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Cost Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { tip: "Use smaller models for simple tasks", savings: "~$2,400/mo" },
                { tip: "Implement caching for repeated queries", savings: "~$1,800/mo" },
                { tip: "Batch API requests to reduce overhead", savings: "~$950/mo" },
                { tip: "Set max tokens limits per request", savings: "~$1,200/mo" },
                { tip: "Use streaming for partial results", savings: "~$600/mo" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{item.tip}</span>
                  </div>
                  <Badge variant="success">{item.savings}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
