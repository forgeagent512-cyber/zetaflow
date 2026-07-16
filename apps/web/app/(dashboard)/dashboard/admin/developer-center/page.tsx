"use client";

import { useState } from "react";
import {
  Code,
  BookOpen,
  Key,
  Webhook,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Terminal,
  FileJson,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface APIKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  status: "active" | "paused";
}

export default function DeveloperCenterPage() {
  const [activeTab, setActiveTab] = useState("docs");
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    { id: 1, name: "Production API Key", key: "ba_prod_xxxxxxxxxxxx", created: "2026-01-15", lastUsed: "2026-07-09" },
    { id: 2, name: "Development Key", key: "ba_dev_yyyyyyyyyyyy", created: "2026-03-20", lastUsed: "2026-07-08" },
  ]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: 1, name: "Deployment Notifications", url: "https://hooks.buildagent.ai/deploy", events: ["deployment.completed", "deployment.failed"], status: "active" },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKey, setShowKey] = useState<number | null>(null);

  const generateKey = () => {
    if (!newKeyName) return;
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const key = `ba_${Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
    setApiKeys([...apiKeys, { id: Date.now(), name: newKeyName, key, created: new Date().toISOString().split("T")[0], lastUsed: "Never" }]);
    setNewKeyName("");
  };

  const deleteKey = (id: number) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Developer Center"
          description="API documentation, keys, and webhooks."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Developer Center" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "API Keys", value: apiKeys.length.toString(), icon: Key },
            { label: "Webhooks", value: webhooks.length.toString(), icon: Webhook },
            { label: "API Versions", value: "v2", icon: Code },
            { label: "SDK Languages", value: "4", icon: Terminal },
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="docs">API Docs</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="docs">
            <Card className="glass">
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>BuildAgent API reference.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-white/5">
                  <h3 className="font-medium text-sm mb-2">Authentication</h3>
                  <div className="bg-black/30 rounded p-3">
                    <code className="text-xs text-emerald-400">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5">
                  <h3 className="font-medium text-sm mb-2">Base URL</h3>
                  <div className="bg-black/30 rounded p-3">
                    <code className="text-xs text-emerald-400">https://api.buildagent.ai/v2</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Available Endpoints</h3>
                  {[
                    { method: "GET", path: "/organizations", desc: "List all organizations" },
                    { method: "POST", path: "/organizations", desc: "Create an organization" },
                    { method: "GET", path: "/organizations/{id}", desc: "Get organization details" },
                    { method: "PUT", path: "/organizations/{id}", desc: "Update organization" },
                    { method: "DELETE", path: "/organizations/{id}", desc: "Delete organization" },
                    { method: "GET", path: "/deployments", desc: "List deployments" },
                    { method: "POST", path: "/deployments", desc: "Create a deployment" },
                    { method: "GET", path: "/analytics", desc: "Get analytics data" },
                    { method: "POST", path: "/content/generate", desc: "Generate AI content" },
                  ].map((endpoint, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Badge variant={endpoint.method === "GET" ? "success" : endpoint.method === "POST" ? "default" : endpoint.method === "PUT" ? "warning" : "destructive"} className="w-16 justify-center">
                        {endpoint.method}
                      </Badge>
                      <code className="text-xs font-mono flex-1">{endpoint.path}</code>
                      <span className="text-xs text-muted-foreground">{endpoint.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-white/5">
                  <h3 className="font-medium text-sm mb-2">SDK Installation</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-black/30 rounded p-2 text-emerald-400">npm install @buildagent/sdk</div>
                    <div className="bg-black/30 rounded p-2 text-emerald-400">pip install buildagent-sdk</div>
                    <div className="bg-black/30 rounded p-2 text-emerald-400">go get github.com/buildagent/sdk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your API access keys.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name" className="w-48" />
                    <Button onClick={generateKey} disabled={!newKeyName} size="sm" className="gap-1">
                      <Plus className="h-4 w-4" /> Generate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 rounded-lg bg-white/5 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-sm">{apiKey.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}>
                            {showKey === apiKey.id ? "Hide" : "Show"}
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(apiKey.key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => deleteKey(apiKey.id)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono text-xs bg-black/30 rounded p-2">
                        {showKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 8)}...${apiKey.key.slice(-4)}`}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Created: {apiKey.created}</span>
                        <span>Last Used: {apiKey.lastUsed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Webhooks</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> New Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {webhooks.map((wh) => (
                    <div key={wh.id} className="p-4 rounded-lg bg-white/5 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">{wh.name}</span>
                          <Badge variant={wh.status === "active" ? "success" : "secondary"}>{wh.status}</Badge>
                        </div>
                      </div>
                      <div className="text-xs font-mono bg-black/30 rounded p-2 mb-2 text-emerald-400">{wh.url}</div>
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((evt) => (
                          <Badge key={evt} variant="outline" className="text-xs">{evt}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
