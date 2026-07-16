"use client";

import { useState } from "react";
import {
  Rocket,
  Play,
  Pause,
  RotateCcw,
  Power,
  Plus,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Deployment {
  id: number;
  name: string;
  type: string;
  environment: string;
  status: "running" | "paused" | "failed" | "completed" | "deploying";
  version: string;
  createdAt: string;
  logs: string[];
}

const initialDeployments: Deployment[] = [
  { id: 1, name: "api-server-v2", type: "API Server", environment: "production", status: "running", version: "2.4.1", createdAt: "2026-07-01", logs: ["[12:00] Deploy started", "[12:01] Build complete", "[12:02] Health check passed", "[12:03] Running"] },
  { id: 2, name: "web-app-frontend", type: "Web App", environment: "staging", status: "deploying", version: "1.8.3", createdAt: "2026-07-02", logs: ["[11:30] Deploy started", "[11:31] Building assets"] },
  { id: 3, name: "worker-queue", type: "Background Worker", environment: "production", status: "paused", version: "3.1.0", createdAt: "2026-06-28", logs: ["[10:00] Deploy started", "[10:02] Deploy completed", "[10:05] Paused by admin"] },
  { id: 4, name: "ai-model-service", type: "ML Service", environment: "production", status: "failed", version: "0.9.5", createdAt: "2026-07-01", logs: ["[09:00] Deploy started", "[09:01] Build failed: OOM error"] },
  { id: 5, name: "cms-backend", type: "API Server", environment: "development", status: "completed", version: "1.0.0", createdAt: "2026-06-25", logs: ["[08:00] Deploy started", "[08:03] Build complete", "[08:05] Deploy completed successfully"] },
];

export default function DeploymentManagerPage() {
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments);
  const [activeTab, setActiveTab] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newEnv, setNewEnv] = useState("");
  const [newConfig, setNewConfig] = useState("");

  const createDeployment = () => {
    if (!newName) return;
    setDeployments([{
      id: Date.now(),
      name: newName,
      type: newType || "Web App",
      environment: newEnv || "development",
      status: "completed",
      version: "1.0.0",
      createdAt: new Date().toISOString().split("T")[0],
      logs: ["[Now] Deploy created"],
    }, ...deployments]);
    setNewName("");
    setNewType("");
    setNewEnv("");
    setNewConfig("");
    setShowForm(false);
  };

  const updateStatus = (id: number, newStatus: Deployment["status"]) => {
    setDeployments(deployments.map((d) => d.id === id ? { ...d, status: newStatus, logs: [...d.logs, `[${new Date().toLocaleTimeString()}] Status changed to ${newStatus}`] } : d));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
      running: "success", paused: "warning", failed: "destructive", completed: "secondary", deploying: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Deployment Center"
          description="Manage platform deployments and releases."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Deployment Manager" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Deployments", value: deployments.length.toString(), icon: Rocket },
            { label: "Running", value: deployments.filter((d) => d.status === "running").length.toString(), icon: Play },
            { label: "Failed", value: deployments.filter((d) => d.status === "failed").length.toString(), icon: AlertCircle },
            { label: "Paused", value: deployments.filter((d) => d.status === "paused").length.toString(), icon: Pause },
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
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <div className="flex items-center justify-between">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "New Deployment"}
          </Button>
        </div>

        {showForm && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Create Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Deployment name" />
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API Server">API Server</SelectItem>
                    <SelectItem value="Web App">Web App</SelectItem>
                    <SelectItem value="Background Worker">Background Worker</SelectItem>
                    <SelectItem value="ML Service">ML Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newEnv} onValueChange={setNewEnv}>
                  <SelectTrigger><SelectValue placeholder="Environment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={newConfig} onChange={(e) => setNewConfig(e.target.value)} placeholder="Config (JSON)" />
              </div>
              <Button onClick={createDeployment} disabled={!newName} className="gap-2">
                <Rocket className="h-4 w-4" /> Create Deployment
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="glass">
          <CardHeader>
            <CardTitle>Deployments</CardTitle>
            <CardDescription>All platform deployments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.map((dep) => (
                <div key={dep.id} className="p-4 rounded-lg bg-white/5 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Rocket className={`h-4 w-4 ${dep.status === "running" ? "text-emerald-500" : dep.status === "failed" ? "text-red-500" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{dep.name}</span>
                      <Badge variant="outline" className="text-xs">{dep.type}</Badge>
                      <Badge variant={dep.environment === "production" ? "default" : "secondary"} className="text-xs">{dep.environment}</Badge>
                      {getStatusBadge(dep.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      {dep.status === "running" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => updateStatus(dep.id, "paused")} title="Pause">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {dep.status === "paused" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => updateStatus(dep.id, "running")} title="Resume">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {dep.status === "completed" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => updateStatus(dep.id, "running")} title="Restart">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {(dep.status === "running" || dep.status === "paused") && (
                        <Button variant="ghost" size="icon-sm" onClick={() => updateStatus(dep.id, "completed")} title="Stop">
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                      {dep.status === "failed" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => updateStatus(dep.id, "running")} title="Rollback">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => setSelectedLogs(selectedLogs === dep.id ? null : dep.id)} title="Logs">
                        <Terminal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>v{dep.version}</span>
                    <span>Created: {dep.createdAt}</span>
                  </div>
                  {selectedLogs === dep.id && (
                    <div className="mt-3 p-3 rounded bg-black/40 max-h-40 overflow-y-auto">
                      {dep.logs.map((log, i) => (
                        <p key={i} className="text-xs text-emerald-400 font-mono">{log}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
