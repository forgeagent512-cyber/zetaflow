"use client";

import { useState, useEffect } from "react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/api/client";
import {
  Plus,
  Search,
  FileText,
  History,
  RotateCcw,
  Play,
  Edit3,
  Trash2,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  Eye,
  X,
} from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  description: string;
  version: number;
  status: "active" | "draft" | "archived";
  created_at: string;
  updated_at: string;
}

interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  content: string;
  variables: string[];
  created_at: string;
}

const CATEGORIES = [
  "All",
  "General",
  "Coding",
  "Creative",
  "Analysis",
  "Marketing",
  "Support",
  "Sales",
];

export default function PromptManagerPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewingVersions, setViewingVersions] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [testingPrompt, setTestingPrompt] = useState<Prompt | null>(null);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState("");
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({ name: "", content: "", category: "General", description: "", variables: "" });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompts" | "versions" | "test">("prompts");

  useEffect(() => {
    loadPrompts();
  }, [search, category, page]);

  async function loadPrompts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (category && category !== "All") params.set("category", category);
      const res = await apiClient.get(`/api/prompts?${params}`);
      setPrompts(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setPrompts([]);
    }
    setLoading(false);
  }

  async function loadVersions(prompt: Prompt) {
    setViewingVersions(prompt);
    try {
      const res = await apiClient.get(`/api/prompts/${prompt.id}/versions`);
      setVersions(res.data.data ?? []);
    } catch {
      setVersions([]);
    }
  }

  async function handleCreateOrUpdate() {
    if (!form.name.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const variables = form.variables ? form.variables.split(",").map((v) => v.trim()).filter(Boolean) : [];
      const body = { ...form, variables };
      if (editingPrompt) {
        await apiClient.put(`/api/prompts/${editingPrompt.id}`, body);
      } else {
        await apiClient.post("/api/prompts", body);
      }
      setShowCreateModal(false);
      setEditingPrompt(null);
      setForm({ name: "", content: "", category: "General", description: "", variables: "" });
      loadPrompts();
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prompt?")) return;
    try {
      await apiClient.delete(`/api/prompts/${id}`);
      loadPrompts();
    } catch { /* ignore */ }
  }

  async function handleRollback(prompt: Prompt, version: number) {
    try {
      await apiClient.post(`/api/prompts/${prompt.id}/rollback`, { version });
      loadVersions(prompt);
      loadPrompts();
    } catch { /* ignore */ }
  }

  async function handleTest() {
    if (!testingPrompt) return;
    setTesting(true);
    setTestResult("");
    try {
      const res = await apiClient.post(`/api/prompts/${testingPrompt.id}/test`, { variables: testVariables });
      setTestResult(res.data.data ?? "Test completed successfully.");
    } catch {
      setTestResult("Test failed. Please check your variables and try again.");
    }
    setTesting(false);
  }

  function openEdit(prompt: Prompt) {
    setEditingPrompt(prompt);
    setForm({
      name: prompt.name,
      content: prompt.content,
      category: prompt.category,
      description: prompt.description ?? "",
      variables: (prompt.variables ?? []).join(", "),
    });
    setShowCreateModal(true);
  }

  function openTest(prompt: Prompt) {
    setTestingPrompt(prompt);
    setTestVariables({});
    setTestResult("");
    setActiveTab("test");
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Prompt Manager"
          description="Create, manage, and test AI prompts across your organization"
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Prompt Manager" },
          ]}
          actions={
            <Button onClick={() => { setEditingPrompt(null); setForm({ name: "", content: "", category: "General", description: "", variables: "" }); setShowCreateModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          }
        />

        <StaggerWrapper className="space-y-6">
          <StaggerItem>
            <Card className="glass">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Prompts ({total})
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prompts..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 h-9 w-full sm:w-[200px]"
                      />
                    </div>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                      <SelectTrigger className="h-9 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : prompts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium mb-1">No prompts found</p>
                    <p className="text-sm">Create your first prompt to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="p-4 rounded-lg bg-white/5 border border-border hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{prompt.name}</span>
                              <Badge variant="outline" className="text-[10px]">{prompt.category}</Badge>
                              <Badge
                                variant={prompt.status === "active" ? "success" : prompt.status === "draft" ? "warning" : "secondary"}
                                className="text-[10px]"
                              >
                                {prompt.status}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">
                                v{prompt.version}
                              </Badge>
                            </div>
                            {prompt.description && (
                              <p className="text-xs text-muted-foreground truncate">{prompt.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated {new Date(prompt.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(prompt)} title="Edit">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => loadVersions(prompt)} title="Versions">
                              <History className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => openTest(prompt)} title="Test">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(prompt.id)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {total > 20 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="xs" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Previous
                      </Button>
                      <Button variant="outline" size="xs" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {viewingVersions && (
            <StaggerItem>
              <Card className="glass border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-primary" />
                      Version History: {viewingVersions.name}
                    </CardTitle>
                    <Button variant="ghost" size="icon-sm" onClick={() => setViewingVersions(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No version history available</p>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((ver) => (
                        <div
                          key={ver.id}
                          className="p-3 rounded-lg bg-white/5 border border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">v{ver.version}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(ver.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[400px]">
                              {ver.content.substring(0, 100)}...
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleRollback(viewingVersions, ver.version)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Rollback
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {testingPrompt && activeTab === "test" && (
            <StaggerItem>
              <Card className="glass border-amber-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Play className="h-4 w-4 text-amber-500" />
                      Test Prompt: {testingPrompt.name}
                    </CardTitle>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setTestingPrompt(null); setTestResult(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-border">
                      <p className="text-xs font-medium mb-1">Prompt Content:</p>
                      <p className="text-xs text-muted-foreground">{testingPrompt.content}</p>
                    </div>
                    {(testingPrompt.variables ?? []).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Variables:</p>
                        {(testingPrompt.variables ?? []).map((v: string) => (
                          <Input
                            key={v}
                            placeholder={`Enter value for {{${v}}}...`}
                            value={testVariables[v] ?? ""}
                            onChange={(e) => setTestVariables((prev) => ({ ...prev, [v]: e.target.value }))}
                            className="h-9 text-sm"
                          />
                        ))}
                      </div>
                    )}
                    <Button onClick={handleTest} disabled={testing}>
                      {testing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {testing ? "Testing..." : "Run Test"}
                    </Button>
                    {testResult && (
                      <div className="p-4 rounded-lg bg-white/5 border border-border">
                        <p className="text-xs font-medium mb-2 text-amber-500">Test Result:</p>
                        <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )}
        </StaggerWrapper>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Card className="glass w-full max-w-lg mx-4 border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {editingPrompt ? "Edit Prompt" : "Create New Prompt"}
                  </CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => { setShowCreateModal(false); setEditingPrompt(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Name *</label>
                    <Input
                      placeholder="Prompt name..."
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Category</label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter((c) => c !== "All").map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Variables (comma-separated)</label>
                      <Input
                        placeholder="name, topic, tone..."
                        value={form.variables}
                        onChange={(e) => setForm({ ...form, variables: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Description</label>
                    <Input
                      placeholder="Brief description..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Content *</label>
                    <Textarea
                      placeholder="Enter your prompt template content..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingPrompt(null); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOrUpdate} disabled={saving || !form.name.trim() || !form.content.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : editingPrompt ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
