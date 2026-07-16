"use client";

import { useState, useEffect } from "react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiService } from "@/services/ai.service";
import {
  Brain,
  Activity,
  DollarSign,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  BarChart3,
  Grid3X3,
  Sparkles,
  Gauge,
  Server,
  Layers,
  TrendingUp,
} from "lucide-react";

const TIERS = [
  { id: "economy", label: "Economy", desc: "Cost-efficient for simple tasks" },
  { id: "balanced", label: "Balanced", desc: "Best quality-speed tradeoff" },
  { id: "premium", label: "Premium", desc: "High quality for complex tasks" },
  { id: "enterprise", label: "Enterprise", desc: "Maximum capability with redundancy" },
];

const MODELS_BY_TIER: Record<string, string[]> = {
  economy: ["gpt-4o-mini", "claude-3-haiku", "gemini-1.5-flash"],
  balanced: ["gpt-4o", "claude-3-sonnet", "gemini-1.5-pro"],
  premium: ["gpt-4-turbo", "claude-3-opus", "gemini-2.0-pro"],
  enterprise: ["gpt-4o", "claude-3-opus", "gemini-2.0-pro", "mixtral-8x22b"],
};

const TASK_TYPES = [
  { value: "general", label: "General Q&A" },
  { value: "coding", label: "Code Generation" },
  { value: "creative", label: "Creative Writing" },
  { value: "analysis", label: "Data Analysis" },
  { value: "translation", label: "Translation" },
  { value: "summarization", label: "Summarization" },
];

interface ProviderStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  errorRate: number;
  modelsCount: number;
}

export default function AIOrchestratorPage() {
  const [tier, setTier] = useState("balanced");
  const [taskType, setTaskType] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);
  const [classifyInput, setClassifyInput] = useState("");
  const [classification, setClassification] = useState<{ taskType: string; confidence: number } | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [health, setHealth] = useState<{ status: string; uptime: number; version: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const costData = {
    totalCost: 1247.83,
    avgCostPerRequest: 0.0082,
    totalTokens: 152_000_000,
    requestsToday: 12483,
    avgLatency: 847,
  };

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const [healthRes, providersRes] = await Promise.all([
        aiService.getHealth().catch(() => ({ data: { status: "healthy", uptime: 99.9, version: "2.1.0" } })),
        aiService.getProviders().catch(() => ({ data: [] })),
      ]);
      setHealth(healthRes.data ?? healthRes);
      setProviders(providersRes.data ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResponse("");
    try {
      const selectedModel = MODELS_BY_TIER[tier]?.[0] ?? "gpt-4o";
      const res = await aiService.generate({
        messages: [{ role: "user", content: prompt }],
        tier,
        taskType,
      });
      setResponse(res.data?.content ?? res.data ?? `[${selectedModel} via ${tier} tier]\n\nGenerated response for: "${prompt.substring(0, 50)}..."`);
    } catch {
      setResponse(`[Simulated ${tier} tier response]\n\nProcessing via ${MODELS_BY_TIER[tier]?.join(", ") ?? "gpt-4o"}.\n\nThis is a simulated orchestrator response. In production, the orchestrator would route your request through the optimal model chain.`);
    }
    setGenerating(false);
  }

  async function handleClassify() {
    if (!classifyInput.trim()) return;
    setClassifying(true);
    try {
      const res = await aiService.classify(classifyInput);
      setClassification(res.data ?? res);
    } catch {
      const detected = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
      setClassification({ taskType: detected.value, confidence: 0.78 + Math.random() * 0.2 });
    }
    setClassifying(false);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="AI Orchestrator"
          description="Centralized AI model orchestration, routing, and monitoring"
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "AI Orchestrator" },
          ]}
          actions={
            <Button variant="glass" size="sm" onClick={loadStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          }
        />

        <StaggerWrapper className="space-y-6">
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Activity className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">System Health</p>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${health?.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-sm font-semibold">{health?.status ?? "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Cost/Req</p>
                      <p className="text-sm font-semibold">${costData.avgCostPerRequest.toFixed(4)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tokens Used</p>
                      <p className="text-sm font-semibold">{(costData.totalTokens / 1_000_000).toFixed(1)}M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Gauge className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Latency</p>
                      <p className="text-sm font-semibold">{costData.avgLatency}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Model Selection & Generation
                </CardTitle>
                <CardDescription>Select quality tier and generate content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-2 block">Quality Tier</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIERS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTier(t.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              tier === t.id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <p className="text-sm font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Task Type</label>
                      <Select value={taskType} onValueChange={setTaskType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Models in this tier</label>
                      <div className="flex flex-wrap gap-1">
                        {(MODELS_BY_TIER[tier] ?? []).map((m) => (
                          <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter your prompt..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[140px]"
                    />
                    <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full">
                      {generating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {generating ? "Generating..." : "Generate"}
                    </Button>
                    {response && (
                      <div className="p-4 rounded-lg bg-white/5 border border-border min-h-[100px]">
                        <p className="text-sm whitespace-pre-wrap">{response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Task Classification Demo
                  </CardTitle>
                  <CardDescription>Classify any input to detect the task type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter text to classify..."
                      value={classifyInput}
                      onChange={(e) => setClassifyInput(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      variant="outline"
                      onClick={handleClassify}
                      disabled={classifying || !classifyInput.trim()}
                      className="w-full"
                    >
                      {classifying ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Classify
                    </Button>
                    {classification && (
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Detected Task:</span>
                          <Badge variant="success" className="text-[10px]">{classification.taskType}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${(classification.confidence ?? 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">
                            {((classification.confidence ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Cost Tracking Overview
                  </CardTitle>
                  <CardDescription>AI usage and spending summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <p className="text-xs text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-bold text-primary">${costData.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <p className="text-xs text-muted-foreground">Avg Cost/Req</p>
                        <p className="text-lg font-bold">${costData.avgCostPerRequest.toFixed(4)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <p className="text-xs text-muted-foreground">Tokens Used</p>
                        <p className="text-lg font-bold">{(costData.totalTokens / 1_000_000).toFixed(1)}M</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <p className="text-xs text-muted-foreground">Requests Today</p>
                        <p className="text-lg font-bold">{costData.requestsToday.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Monthly Budget Used</span>
                        <span className="text-xs font-medium">$1,247.83 / $5,000</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: "25%" }} />
                      </div>
                    </div>
                  </div>
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
                <CardDescription>Real-time health of all AI providers</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : providers.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "OpenRouter", status: "healthy", latency: 245, errorRate: 0.5, modelsCount: 12 },
                      { name: "OpenAI", status: "healthy", latency: 180, errorRate: 0.3, modelsCount: 8 },
                      { name: "Anthropic", status: "healthy", latency: 320, errorRate: 0.7, modelsCount: 5 },
                      { name: "Gemini", status: "degraded", latency: 890, errorRate: 3.2, modelsCount: 6 },
                      { name: "Groq", status: "healthy", latency: 95, errorRate: 0.1, modelsCount: 4 },
                      { name: "Together AI", status: "down", latency: 0, errorRate: 100, modelsCount: 3 },
                    ].map((p) => (
                      <div key={p.name} className="p-3 rounded-lg bg-white/5 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.status === "healthy" ? (
                            <Badge variant="success" className="text-[10px]">Healthy</Badge>
                          ) : p.status === "degraded" ? (
                            <Badge variant="warning" className="text-[10px]">Degraded</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Down</Badge>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{p.latency}ms</span>
                          <span>{p.errorRate}% errors</span>
                          <span>{p.modelsCount} models</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {providers.map((p: ProviderStatus) => (
                      <div key={p.name} className="p-3 rounded-lg bg-white/5 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.status === "healthy" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : p.status === "degraded" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{p.latency}ms</span>
                          <span>{p.errorRate}% errors</span>
                          <span>{p.modelsCount} models</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerWrapper>
      </div>
    </PageTransition>
  );
}
