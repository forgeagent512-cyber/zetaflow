"use client";

import { AlertTriangle, PauseCircle, BarChart3, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsageStore } from "@/store/use-usage-store";
import { cn } from "@/lib/utils";

const levelConfig: Record<string, { label: string; color: string; icon: typeof BarChart3 }> = {
  normal: { label: "Normal", color: "text-emerald-500", icon: BarChart3 },
  "warning-80": { label: "80% Warning", color: "text-amber-500", icon: AlertTriangle },
  "warning-90": { label: "90% Warning", color: "text-orange-500", icon: AlertTriangle },
  grace: { label: "Grace Mode", color: "text-red-500", icon: Shield },
  paused: { label: "Paused", color: "text-red-600", icon: PauseCircle },
};

export function UsageDashboard() {
  const { records, getCurrentLevel, getUsagePercent, getExceededMetrics } = useUsageStore();
  const level = getCurrentLevel();
  const usagePct = getUsagePercent();
  const exceeded = getExceededMetrics();
  const config = levelConfig[level];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usage Overview</h2>
          <p className="text-sm text-muted-foreground">Current billing period: July 1 - August 1, 2026</p>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium", level !== "normal" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
          <config.icon className="h-3.5 w-3.5" />
          {config.label} — {usagePct}% used
        </div>
      </div>

      {level !== "normal" && (
        <div className={cn("p-4 rounded-xl flex items-start gap-3", level === "paused" ? "bg-red-500/10" : "bg-amber-500/10")}>
          <AlertTriangle className={cn("h-5 w-5 shrink-0 mt-0.5", level === "paused" ? "text-red-500" : "text-amber-500")} />
          <div className="text-sm">
            <p className={cn("font-medium", level === "paused" ? "text-red-500" : "text-amber-500")}>
              {level === "paused" ? "Services Paused — Limit Exceeded" :
               level === "grace" ? "Grace Mode Active — Upgrade to continue full service" :
               "Usage Warning — Approaching plan limits"}
            </p>
            <p className="text-muted-foreground mt-0.5">
              {exceeded.map((r) => `${r.label}: ${Math.round((r.used / r.limit) * 100)}%`).join(", ")}
            </p>
          </div>
          <Button size="sm" className="ml-auto shrink-0">Upgrade Plan</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((record) => {
          const pct = Math.round((record.used / record.limit) * 100);
          const isExceeded = record.used >= record.limit;
          return (
            <Card key={record.metric} className="glass">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{record.label}</span>
                  <span className={cn("text-xs font-medium", isExceeded ? "text-red-500" : pct >= 80 ? "text-amber-500" : "text-muted-foreground")}>
                    {record.used.toLocaleString()} / {record.limit.toLocaleString()} {record.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isExceeded ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isExceeded ? "text-red-500" : "text-muted-foreground"}>
                    {pct}% used
                  </span>
                  {isExceeded && <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Exceeded</Badge>}
                  {pct >= 80 && !isExceeded && <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Near Limit</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
