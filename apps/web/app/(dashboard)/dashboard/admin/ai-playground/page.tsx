"use client";

import { useState, useEffect, useCallback } from "react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
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
import { playgroundService } from "@/services/playground.service";
import {
  Send,
  Save,
  Trash2,
  RefreshCw,
  Columns3,
  Download,
  Upload,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
  Thermometer,
  Gauge,
  FileText,
  History,
  Copy,
  CheckCheck,
  X,
} from "lucide-react";

const MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "claude-3-opus", label: "Claude 3 Opus", provider: "Anthropic" },
  { id: "claude-3-sonnet", label: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "gemini-2.0-pro", label: "Gemini 2.0 Pro", provider: "Google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "Google" },
  { id: "mixtral-8x22b", label: "Mixtral 8x22B", provider: "Mistral" },
  { id: "llama-3-70b", label: "Llama 3 70B", provider: "Meta" },
];

const TIERS = [
  { id: "economy", label: "Economy" },
  { id: "balanced", label: "Balanced" },
  { id: "premium", label: "Premium" },
  { id: "enterprise", label: "Enterprise" },
];

interface Session {
  id: string;
  name: string;
  model: string;
  prompt: string;
  response: string;
  parameters: Record<string, number>;
  created_at: string;
}

interface CompareResult {
  model: string;
  response: string;
  latency: number;
  tokens: number;
}

export default function AIPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [tier, setTier] = useState("balanced");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareModels, setCompareModels] = useState<string[]>(["gpt-4o", "claude-3-sonnet"]);
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [comparing, setComparing] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const res = await playgroundService.getSessions();
      setSessions(res.data ?? []);
    } catch { /* ignore */ }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (compareMode) {
      await handleCompare();
      return;
    }
    setGenerating(true);
    setResponse("");
    try {
      const res = await playgroundService.generate({
        prompt,
        model,
        tier,
        parameters: { temperature, maxTokens },
      });
      setResponse(res.data?.content ?? res.data ?? "Generated response placeholder.");
    } catch {
      setResponse(`Simulated response from ${MODELS.find((m) => m.id === model)?.label ?? model} (${tier} tier, temp: ${temperature})\n\nPrompt: "${prompt.substring(0, 80)}..."\n\nThis is a playground simulation. Connect to a real AI provider for actual responses.`);
    }
    setGenerating(false);
  }

  async function handleCompare() {
    if (!prompt.trim() || compareModels.length < 2) return;
    setComparing(true);
    setCompareResults([]);
    try {
      const res = await playgroundService.compare(prompt, compareModels);
      setCompareResults(res.data ?? []);
    } catch {
      const results: CompareResult[] = compareModels.map((m) => ({
        model: m,
        response: `Response from ${MODELS.find((md) => md.id === m)?.label ?? m}\n\nSimulated response for comparison mode.`,
        latency: Math.round(200 + Math.random() * 800),
        tokens: Math.round(prompt.length * 1.3),
      }));
      setCompareResults(results);
    }
    setComparing(false);
  }

  async function handleSaveSession() {
    if (!currentSessionId && !sessionName.trim()) return;
    setSaving(true);
    try {
      await playgroundService.saveSession({
        name: sessionName || `Session ${sessions.length + 1}`,
        model,
        prompt,
        response,
        parameters: { temperature, maxTokens, tier },
      });
      setSessionName("");
      loadSessions();
    } catch { /* ignore */ }
    setSaving(false);
  }

  function loadSession(session: Session) {
    setPrompt(session.prompt);
    setResponse(session.response);
    setModel(session.model);
    setCurrentSessionId(session.id);
    if (session.parameters) {
      if (session.parameters.temperature) setTemperature(session.parameters.temperature);
      if (session.parameters.maxTokens) setMaxTokens(session.parameters.maxTokens);
    }
  }

  async function handleDeleteSession(id: string) {
    if (!confirm("Delete this session?")) return;
    try {
      await playgroundService.deleteSession(id);
      loadSessions();
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setPrompt("");
        setResponse("");
      }
    } catch { /* ignore */ }
  }

  function handleExport() {
    const data = { prompt, model, tier, temperature, maxTokens, response };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playground-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.prompt) setPrompt(data.prompt);
        if (data.model) setModel(data.model);
        if (data.tier) setTier(data.tier);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        if (data.maxTokens !== undefined) setMaxTokens(data.maxTokens);
        if (data.response) setResponse(data.response);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleCopyResponse() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const toggleCompareModel = (modelId: string) => {
    setCompareModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="AI Playground"
          description="Experiment with AI models, compare outputs, and refine prompts"
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "AI Playground" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant={compareMode ? "default" : "outline"} size="sm" onClick={() => setCompareMode(!compareMode)}>
                <Columns3 className="h-4 w-4 mr-2" />
                {compareMode ? "Single Mode" : "Compare Mode"}
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span><Upload className="h-4 w-4 mr-2" />Import</span>
                </Button>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={!prompt}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="glass" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            </div>
          }
        />

        <div className="flex gap-6">
          {showSidebar && (
            <div className="w-64 shrink-0 space-y-3">
              <Card className="glass">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-xs font-medium flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-1 max-h-[500px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No saved sessions</p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all group ${
                          currentSessionId === session.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => loadSession(session)}
                      >
                        <div className="font-medium truncate">{session.name}</div>
                        <div className="text-muted-foreground truncate mt-0.5">
                          {session.model} &middot; {new Date(session.created_at).toLocaleDateString()}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-5 text-[10px]"
                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1 space-y-6 min-w-0">
            <StaggerWrapper className="space-y-6">
              <StaggerItem>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your prompt here..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[180px] text-sm"
                    />
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-primary" />
                      Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Model</label>
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MODELS.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Tier</label>
                        <Select value={tier} onValueChange={setTier}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIERS.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Temperature: {temperature}
                        </label>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Max Tokens</label>
                        <Input
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                          min={1}
                          max={32768}
                          className="h-9"
                        />
                      </div>
                    </div>
                    {compareMode && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-medium mb-2">Select models to compare (min 2):</p>
                        <div className="flex flex-wrap gap-2">
                          {MODELS.map((m) => (
                            <Badge
                              key={m.id}
                              variant={compareModels.includes(m.id) ? "default" : "outline"}
                              className="cursor-pointer text-[10px]"
                              onClick={() => toggleCompareModel(m.id)}
                            >
                              {m.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleGenerate}
                    disabled={generating || comparing || !prompt.trim() || (compareMode && compareModels.length < 2)}
                  >
                    {(generating || comparing) ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 mr-2" />
                    )}
                    {(generating || comparing) ? "Generating..." : compareMode ? "Compare Models" : "Generate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSaveSession}
                    disabled={saving || !response}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save
                  </Button>
                  <Input
                    placeholder="Session name..."
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-48 h-12"
                  />
                </div>
              </StaggerItem>

              <StaggerItem>
                {compareMode && compareResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compareResults.map((result) => {
                      const modelInfo = MODELS.find((m) => m.id === result.model);
                      return (
                        <Card key={result.model} className="glass border-primary/20">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-2">
                                {modelInfo?.label ?? result.model}
                                <Badge variant="secondary" className="text-[10px]">{modelInfo?.provider}</Badge>
                              </CardTitle>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{result.latency}ms</span>
                                <span>{result.tokens} tokens</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="p-3 rounded-lg bg-white/5 border border-border min-h-[120px]">
                              <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : response ? (
                  <Card className="glass border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Response
                          <Badge variant="secondary" className="text-[10px]">
                            {MODELS.find((m) => m.id === model)?.label ?? model}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {tier} tier
                          </Badge>
                        </CardTitle>
                        <Button variant="ghost" size="icon-sm" onClick={handleCopyResponse}>
                          {copied ? (
                            <CheckCheck className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-white/5 border border-border min-h-[150px]">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{response}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </StaggerItem>
            </StaggerWrapper>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
