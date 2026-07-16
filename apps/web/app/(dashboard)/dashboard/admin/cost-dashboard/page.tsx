"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  PieChart, LineChart, Calendar, Download,
  Filter, ArrowUp, ArrowDown, Eye, FileText,
  CreditCard, Building, Activity,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

type Period = "Daily" | "Weekly" | "Monthly";

const costByModel = [
  { model: "GPT-4o", cost: 12450, percentage: 35, trend: "up" },
  { model: "Claude 3.5 Sonnet", cost: 8920, percentage: 25, trend: "up" },
  { model: "GPT-4o-mini", cost: 5340, percentage: 15, trend: "down" },
  { model: "Gemini 1.5 Pro", cost: 3560, percentage: 10, trend: "up" },
  { model: "Llama 3.1 70B", cost: 2670, percentage: 7.5, trend: "down" },
  { model: "Others", cost: 2670, percentage: 7.5, trend: "stable" },
];

const costByProvider = [
  { provider: "OpenAI", cost: 17790, percentage: 50, color: "bg-emerald-500" },
  { provider: "Anthropic", cost: 8920, percentage: 25, color: "bg-violet-500" },
  { provider: "Gemini", cost: 3560, percentage: 10, color: "bg-blue-500" },
  { provider: "Groq", cost: 2670, percentage: 7.5, color: " bg-amber-500" },
  { provider: "OpenRouter", cost: 2670, percentage: 7.5, color: "bg-rose-500" },
];

const transactions = [
  { id: "TXN-001", description: "GPT-4o API calls", amount: 1245.50, date: "2025-07-09", status: "completed", org: "Org A" },
  { id: "TXN-002", description: "Claude 3.5 Sonnet usage", amount: 892.00, date: "2025-07-09", status: "completed", org: "Org B" },
  { id: "TXN-003", description: "Gemini Pro inference", amount: 534.20, date: "2025-07-08", status: "completed", org: "Org A" },
  { id: "TXN-004", description: "Groq compute units", amount: 267.80, date: "2025-07-08", status: "pending", org: "Org C" },
  { id: "TXN-005", description: "OpenRouter API calls", amount: 178.50, date: "2025-07-07", status: "completed", org: "Org B" },
  { id: "TXN-006", description: "GPT-4o-mini batch", amount: 445.00, date: "2025-07-07", status: "completed", org: "Org D" },
];

export default function CostDashboardPage() {
  const [period, setPeriod] = useState<Period>("Monthly");

  const totalCost = costByModel.reduce((a, b) => a + b.cost, 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Cost Dashboard"
          description="Track and analyze AI model usage costs."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Cost Dashboard" }]}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-input overflow-hidden">
                {(["Daily", "Weekly", "Monthly"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {p}
                  </button>
                ))}
              </div>
              <Button variant="glass" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" />Export</Button>
            </div>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">${totalCost.toLocaleString()}</p><p className="text-xs text-emerald-500">+12.5% vs last {period.toLowerCase()}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Activity className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">$1,185</p><p className="text-xs text-muted-foreground">Based on 30-day avg</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Top Spender</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Building className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">Org A</p><p className="text-xs text-muted-foreground">$12,450 this {period.toLowerCase()}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Budget Used</CardTitle></CardHeader><CardContent><Progress value={68} className="h-2 mb-2" /><div className="flex justify-between text-xs"><span className="text-muted-foreground">$35,600 of $52,000</span><span className="text-amber-500 font-medium">68%</span></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle>Cost by Model</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costByModel.map((item) => (
                  <div key={item.model} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.model}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${item.cost.toLocaleString()}</span>
                        {item.trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-red-500" /> : item.trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Cost by Provider</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costByProvider.map((item) => (
                  <div key={item.provider} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.provider}</span>
                      <span className="font-medium">${item.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search..." className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Description</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Org</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 text-xs font-mono">{tx.id}</td>
                      <td className="py-3">{tx.description}</td>
                      <td className="py-3"><Badge variant="outline" className="text-[10px]">{tx.org}</Badge></td>
                      <td className="py-3 font-medium">${tx.amount.toFixed(2)}</td>
                      <td className="py-3 text-muted-foreground text-xs">{tx.date}</td>
                      <td className="py-3"><Badge variant={tx.status === "completed" ? "success" : "warning"} className="text-[10px]">{tx.status}</Badge></td>
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