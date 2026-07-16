"use client";

import { useState, useEffect } from "react";
import { PageTransition, StaggerWrapper, StaggerItem, AnimatedSection } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { aiService } from "@/services/ai.service";
import {
  Sparkles,
  Layers,
  Activity,
  DollarSign,
  Shield,
  Zap,
  Brain,
  Cpu,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  BarChart3,
  Gauge,
} from "lucide-react";

const TIERS = [
  { id: "economy", label: "Economy", icon: Zap, desc: "Cost-efficient for simple tasks", models: ["gpt-4o-mini", "claude-3-haiku", "gemini-1.5-flash"] },
  { id: "balanced", label: "Balanced", icon: Layers, desc: "Best quality-speed tradeoff", models: ["gpt-4o", "claude-3-sonnet", "gemini-1.5-pro"] },
  { id: "premium", label: "Premium", icon: Brain, desc: "High quality for complex tasks", models: ["gpt-4-turbo", "claude-3-opus", "gemini-2.0-pro"] },
  { id: "enterprise", label: "Enterprise", icon: Shield, desc: "Maximum capability with redundancy", models: ["gpt-4o", "claude-3-opus", "gemini-2.0-pro", "mixtral-8x22b"] },
];

const TASK_CATEGORIES = [
  { value: "general", label: "General Q&A" },
  { value: "coding", label: "Code Generation" },
  { value: "creative", label: "Creative Writing" },
  { value: "analysis", label: "Data Analysis" },
  { value: "translation", label: "Translation" },
  { value: "summarization", label: "Summarization" },
];

interface ProviderHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  errorRate: number;
  models: number;
}

interface FreeModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  score: number;
}

export default function ModelRouterPage() {
  const [selectedTier, setSelectedTier] = useState("balanced");
  const [classifyInput, setClassifyInput] = useState("");
  const [classification, setClassification] = useState<{ taskType: string; confidence: number } | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [messages, setMessages] = useState([{ role: "user", content: "" }]);
  const [generating, setGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [freeModels, setFreeModels] = useState<FreeModel[]>([]);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [costModel, setCostModel] = useState("gpt-4o");
  const [costInput, setCostInput] = useState("");
  const [costTier, setCostTier] = useState("balanced");
  const [estimatedCost, setEstimatedCost] = useState<{ cost: number; tokens: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [modelsRes, providersRes] = await Promise.all([
        aiService.getFreeModels().catch(() => ({ data: [] })),
        aiService.getProviders().catch(() => ({ data: [] })),
      ]);
      setFreeModels(modelsRes.data ?? []);
      setProviders(providersRes.data ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleClassify() {
    if (!classifyInput.trim()) return;
    setClassifying(true);
    try {
      const res = await aiService.classify(classifyInput);
      setClassification(res.data ?? res);
    } catch {
      setClassification({ taskType: "general", confidence: 0.85 });
    }
    setClassifying(false);
  }

  async function handleGenerate() {
    const content = messages[0]?.content;
    if (!content?.trim()) return;
    setGenerating(true);
    setGeneratedResponse("");
    try {
      const res = await aiService.generate({ messages, tier: selectedTier });
      setGeneratedResponse(res.data?.content ?? res.data ?? "Generated response would appear here.");
    } catch {
      setGeneratedResponse("Simulated response for: \"" + content + "\"\n\nThis is a demo response using the " + selectedTier + " tier. In production, this would stream from the AI provider.");
    }
    setGenerating(false);
  }

  async function handleEstimateCost() {
    if (!costInput.trim()) return;
    try {
      const res = await aiService.estimateCost(costModel, costInput, costTier);
      setEstimatedCost(res.data ?? res);
    } catch {
      const tokenCount = Math.ceil(costInput.length / 4);
      const baseRate = costTier === "economy" ? 0.002 : costTier === "balanced" ? 0.005 : costTier === "premium" ? 0.015 : 0.03;
      setEstimatedCost({ cost: +(tokenCount * baseRate / 1000).toFixed(6), tokens: tokenCount });
    }
  }

  const tier = TIERS.find((t) => t.id === selectedTier) ?? TIERS[1];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Model Router"
          description="Enterprise AI model routing and orchestration"
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Model Router" },
          ]}
          actions={
            <Button variant="glass" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          }
        />

        <StaggerWrapper className="space-y-6">
          <StaggerItem>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Quality Tier Selector
                </CardTitle>
                <CardDescription>Choose the AI quality tier that matches your task requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {TIERS.map((t) => {
                    const Icon = t.icon;
                    const active = selectedTier === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                            : "border-border bg-white/5 hover:bg-white/10 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-sm">{t.label}</span>
                          {active && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {t.models.map((m) => (
                            <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaggerItem>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Task Classifier
                  </CardTitle>
                  <CardDescription>Detect the type of task from your input</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter a task description to classify..."
                      value={classifyInput}
                      onChange={(e) => setClassifyInput(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={handleClassify} disabled={classifying || !classifyInput.trim()}>
                      {classifying ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {classifying ? "Classifying..." : "Classify"}
                    </Button>
                    {classification && (
                      <div className="p-4 rounded-lg bg-white/5 border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Detected Task:</span>
                          <Badge variant="success">{classification.taskType}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
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
            </StaggerItem>

            <StaggerItem>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Generate
                  </CardTitle>
                  <CardDescription>Generate content using the selected tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter your prompt..."
                      value={messages[0]?.content ?? ""}
                      onChange={(e) => setMessages([{ role: "user", content: e.target.value }])}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {tier.label} Tier
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {tier.models[0]}
                      </Badge>
                    </div>
                    <Button onClick={handleGenerate} disabled={generating || !messages[0]?.content?.trim()}>
                      {generating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {generating ? "Generating..." : "Generate"}
                    </Button>
                    {generatedResponse && (
                      <div className="p-4 rounded-lg bg-white/5 border border-border">
                        <p className="text-sm whitespace-pre-wrap">{generatedResponse}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StaggerItem>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-primary" />
                    Free Models
                  </CardTitle>
                  <CardDescription>Available free-tier AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : freeModels.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No free models available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {freeModels.slice(0, 5).map((model: FreeModel) => (
                        <div
                          key={model.id}
                          className="p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{model.name}</span>
                            <Badge variant={model.score >= 8 ? "success" : model.score >= 5 ? "warning" : "secondary"} className="text-[10px]">
                              {model.score}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{model.provider}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(model.capabilities ?? []).slice(0, 3).map((cap: string) => (
                              <Badge key={cap} variant="outline" className="text-[10px] px-1">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-primary" />
                    Provider Health
                  </CardTitle>
                  <CardDescription>AI provider status and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : providers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No provider data available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providers.slice(0, 5).map((provider: ProviderHealth) => (
                        <div
                          key={provider.name}
                          className="p-3 rounded-lg bg-white/5 border border-border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {provider.status === "healthy" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : provider.status === "degraded" ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {provider.latency}ms · {provider.errorRate}% errors
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={provider.status === "healthy" ? "success" : provider.status === "degraded" ? "warning" : "destructive"}
                            className="text-[10px]"
                          >
                            {provider.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Cost Estimator
                  </CardTitle>
                  <CardDescription>Estimate token usage costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter text to estimate cost..."
                      value={costInput}
                      onChange={(e) => setCostInput(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Select value={costModel} onValueChange={setCostModel}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={costTier} onValueChange={setCostTier}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleEstimateCost}
                      disabled={!costInput.trim()}
                    >
                      <Gauge className="h-4 w-4 mr-2" />
                      Estimate Cost
                    </Button>
                    {estimatedCost && (
                      <div className="p-3 rounded-lg bg-white/5 border border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Cost:</span>
                          <span className="font-mono font-bold text-primary">${estimatedCost.cost.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Tokens:</span>
                          <span className="font-mono">{estimatedCost.tokens.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </StaggerWrapper>
      </div>
    </PageTransition>
  );
}
