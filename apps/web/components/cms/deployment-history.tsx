"use client";

import { useState } from "react";
import {
  Rocket, Play, Pause, RotateCcw, XCircle, FileText, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeploymentsStore } from "@/store/use-deployments-store";
import { useProductsStore } from "@/store/use-products-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: typeof Rocket; className: string }> = {
  installing: { label: "Installing", icon: Loader2, className: "text-blue-500 bg-blue-500/10" },
  running: { label: "Running", icon: Play, className: "text-emerald-500 bg-emerald-500/10" },
  paused: { label: "Paused", icon: Pause, className: "text-amber-500 bg-amber-500/10" },
  failed: { label: "Failed", icon: XCircle, className: "text-red-500 bg-red-500/10" },
  stopped: { label: "Stopped", icon: AlertCircle, className: "text-muted-foreground bg-muted" },
};

export function DeploymentHistory() {
  const { deployments, retryDeployment, rollbackDeployment, pauseDeployment, resumeDeployment } = useDeploymentsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deployments</h1>
        <p className="text-sm text-muted-foreground mt-1">{deployments.length} total deployments</p>
      </div>

      {deployments.length === 0 ? (
        <div className="glass rounded-xl py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No deployments yet</h3>
          <p className="text-sm text-muted-foreground">Install a product from the store to see your deployments here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((dep) => {
            const config = statusConfig[dep.status];
            const Icon = config.icon;
            return (
              <Card key={dep.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.className)}>
                        <Icon className={cn("h-5 w-5", dep.status === "installing" && "animate-spin")} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{dep.productName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(dep.startedAt).toLocaleDateString()}</span>
                          <Badge variant="outline" className={cn("text-[10px]", config.className)}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {dep.status === "running" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { pauseDeployment(dep.id); toast.info("Deployment paused"); }}>
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {dep.status === "paused" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { resumeDeployment(dep.id); toast.success("Deployment resumed"); }}>
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {dep.status === "failed" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-500" onClick={() => { retryDeployment(dep.id); toast.success("Retrying deployment..."); }}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(dep.status === "running" || dep.status === "failed") && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => { rollbackDeployment(dep.id); toast.warning("Rolling back deployment"); }}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpandedId(expandedId === dep.id ? null : dep.id)}>
                        {expandedId === dep.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {expandedId === dep.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Deployment Logs
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto bg-muted/50 rounded-lg p-3">
                        {dep.logs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No logs available.</p>
                        ) : (
                          dep.logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-2 text-xs font-mono">
                              <span className={cn(
                                "shrink-0 mt-0.5",
                                log.level === "error" ? "text-red-500" : log.level === "warn" ? "text-amber-500" : "text-emerald-500"
                              )}>
                                {log.level === "error" ? "✗" : log.level === "warn" ? "!" : ">"}
                              </span>
                              <span className="text-muted-foreground">{log.message}</span>
                              <span className="text-muted-foreground/50 ml-auto shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Deployment ID:</span> {dep.id}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
