"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Users, CreditCard, FileText,
  RefreshCw, AlertTriangle, BarChart3, PieChart, Activity, Eye, EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminBillingStore } from "@/store/use-admin-billing-store";
import { useBillingStore } from "@/store/use-billing-store";
import { cn } from "@/lib/utils";

export function AdminBillingPanel() {
  const { totalRevenue, mrr, arr, activeSubscriptions, totalCustomers, aiCosts, getAICostSummary, getRevenueData } = useAdminBillingStore();
  const { invoices, transactions, coupons } = useBillingStore();
  const [showAIProviders, setShowAIProviders] = useState(false);

  const aiSummary = getAICostSummary("2026-07");
  const revenueData = getRevenueData();
  const failedCount = transactions.filter((t) => t.status === "failed").length;
  const pendingCount = invoices.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+12.5%", trend: "up", icon: DollarSign },
          { label: "MRR", value: `$${mrr.toLocaleString()}`, change: "+8.3%", trend: "up", icon: TrendingUp },
          { label: "ARR", value: `$${arr.toLocaleString()}`, change: "+15.2%", trend: "up", icon: TrendingUp },
          { label: "Active Subs", value: activeSubscriptions.toString(), change: "+23", trend: "up", icon: Users },
          { label: "Total Customers", value: totalCustomers.toString(), change: "+47", trend: "up", icon: Users },
          { label: "Failed Payments", value: failedCount.toString(), change: "-2", trend: "down", icon: AlertTriangle },
          { label: "Pending Invoices", value: pendingCount.toString(), change: "+3", trend: "up", icon: FileText },
          { label: "AI Cost (Jul)", value: `$${aiSummary.totalCost.toLocaleString()}`, change: `${aiSummary.profitMargin.toFixed(1)}% margin`, trend: "up", icon: Activity },
          { label: "Coupons Active", value: coupons.length.toString(), change: "—", trend: "up", icon: CreditCard },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className={cn("text-[10px]", stat.trend === "up" ? "text-emerald-500" : "text-red-500")}>{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Revenue vs AI Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-1">
              {revenueData.map((d) => {
                const maxVal = Math.max(...revenueData.map((r) => Math.max(r.revenue, r.costs)));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex flex-col items-center" style={{ height: "160px", justifyContent: "flex-end" }}>
                      <div className="w-3/4 rounded-t-sm bg-primary/60" style={{ height: `${(d.revenue / maxVal) * 100}%` }} />
                      <div className="w-3/4 rounded-t-sm bg-rose-500/60" style={{ height: `${(d.costs / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary/60" /> Revenue</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500/60" /> AI Costs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>AI Cost Breakdown</span>
              <button onClick={() => setShowAIProviders(!showAIProviders)} className="text-muted-foreground hover:text-foreground">
                {showAIProviders ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {showAIProviders && (
              <div className="text-[10px] text-muted-foreground mb-2">Provider names visible to admins only</div>
            )}
            {Object.entries(aiSummary.costByProvider).map(([provider, cost]) => {
              const pct = aiSummary.totalCost > 0 ? (cost / aiSummary.totalCost) * 100 : 0;
              return (
                <div key={provider} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn(!showAIProviders && "blur-sm select-none")}>
                      {showAIProviders ? provider.charAt(0).toUpperCase() + provider.slice(1) : "AI Provider"}
                    </span>
                    <span className="font-medium">${cost.toLocaleString()}</span>
                  </div>
                  {!showAIProviders && (
                    <div className="text-[10px] text-muted-foreground">Provider hidden — admin only</div>
                  )}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t flex items-center justify-between text-xs font-medium">
              <span>Total AI Cost</span>
              <span>${aiSummary.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profit Margin</span>
              <span className={cn("font-medium", aiSummary.profitMargin > 0 ? "text-emerald-500" : "text-red-500")}>
                {aiSummary.profitMargin.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent-payments">
        <TabsList className="glass">
          <TabsTrigger value="recent-payments" className="text-xs">Recent Payments</TabsTrigger>
          <TabsTrigger value="failed-payments" className="text-xs">Failed Payments</TabsTrigger>
          <TabsTrigger value="coupons" className="text-xs">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="recent-payments" className="mt-3 space-y-1">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 text-xs">
              <span>{tx.invoiceNumber}</span>
              <span>${tx.amount.toFixed(2)}</span>
              <Badge variant={tx.status === "succeeded" ? "secondary" : "destructive"} className="text-[10px]">{tx.status}</Badge>
              <span className="text-muted-foreground">{new Date(tx.processedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="failed-payments" className="mt-3">
          {failedCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No failed payments.</p>
          ) : (
            <p className="text-sm text-muted-foreground">{failedCount} failed payments need review.</p>
          )}
        </TabsContent>
        <TabsContent value="coupons" className="mt-3">
          {coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No coupons created.</p>
          ) : (
            coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 text-xs">
                <span className="font-mono">{c.code}</span>
                <span>{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</span>
                <Badge variant={c.active ? "secondary" : "outline"} className="text-[10px]">{c.active ? "Active" : "Inactive"}</Badge>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
