"use client";

import { useState } from "react";
import {
  Upload, Download, Plus, Trash2, Copy, Eye,
  CheckSquare, Square, Search, Filter, MoreHorizontal, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTemplateEngine } from "@/store/use-template-engine";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminTemplateManager() {
  const { templates, updateTemplate, deleteTemplate, duplicateTemplate, bulkPublish, bulkDelete, bulkArchive } = useTemplateEngine();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = templates.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (query && !t.title.toLowerCase().includes(query.toLowerCase()) && !t.tags.some((tag) => tag.includes(query))) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((t) => t.id));
  };

  const handleBulkAction = (action: "publish" | "archive" | "delete") => {
    if (selected.length === 0) return;
    if (action === "publish") bulkPublish(selected);
    if (action === "archive") bulkArchive(selected);
    if (action === "delete") bulkDelete(selected);
    toast.success(`${selected.length} templates ${action}ed successfully`);
    setSelected([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{templates.length} templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" /> New Template
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 glass" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/50">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleBulkAction("publish")}>
            <Publish className="h-3 w-3" /> Publish
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleBulkAction("archive")}>
            <Archive className="h-3 w-3" /> Archive
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500" onClick={() => handleBulkAction("delete")}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelected([])}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card className="glass">
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-muted-foreground">
              <button onClick={toggleAll} className="p-0.5">
                {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </button>
              <span className="flex-1">Name</span>
              <span className="w-24">Category</span>
              <span className="w-20">Difficulty</span>
              <span className="w-20">Status</span>
              <span className="w-16">Imports</span>
              <span className="w-24">Updated</span>
              <span className="w-10" />
            </div>
            {filtered.map((template) => (
              <div key={template.id} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/30 transition-colors">
                <button onClick={() => toggleSelect(template.id)} className="p-0.5">
                  {selected.includes(template.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{template.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{template.summary}</p>
                </div>
                <span className="w-24 text-xs text-muted-foreground capitalize">{template.category.replace("-", " ")}</span>
                <span className="w-20">
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    template.difficulty === "beginner" && "text-emerald-500",
                    template.difficulty === "intermediate" && "text-amber-500",
                    template.difficulty === "advanced" && "text-red-500",
                    template.difficulty === "expert" && "text-purple-500",
                  )}>{template.difficulty}</Badge>
                </span>
                <span className="w-20">
                  <Badge variant={template.status === "published" ? "default" : template.status === "draft" ? "secondary" : "outline"} className="text-[10px] capitalize">
                    {template.status}
                  </Badge>
                </span>
                <span className="w-16 text-xs text-muted-foreground">{template.importCount.toLocaleString()}</span>
                <span className="w-24 text-xs text-muted-foreground">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => updateTemplate(template.id, { status: "published" })}>
                      <Publish className="h-3.5 w-3.5 mr-2" /> Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateTemplate(template.id, { status: "draft" })}>
                      <Eye className="h-3.5 w-3.5 mr-2" /> Save as Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateTemplate(template.id)}>
                      <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateTemplate(template.id, { status: "archived" })}>
                      <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteTemplate(template.id)} className="text-red-500">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Publish(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>;
}

function Archive(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>;
}
