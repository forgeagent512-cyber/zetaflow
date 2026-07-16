"use client";

import { useState } from "react";
import {
  Search, Scan, Sparkles, Star, Download, Clock, BarChart3, Filter,
  Grid3X3, List, ArrowUpDown, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplateEngine } from "@/store/use-template-engine";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TemplateEngine() {
  const { templates, autoScanning, scanProgress, startAutoScan, search, getTemplatesByCategory } = useTemplateEngine();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "marketing-ai" | "automation-templates" | "ai-workflows">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = query ? search(query) :
    activeTab === "all" ? templates :
    getTemplatesByCategory(activeTab);

  const totalTemplates = 16000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auto-scanning {totalTemplates.toLocaleString()}+ templates with AI categorization
          </p>
        </div>
        <Button
          onClick={startAutoScan}
          disabled={autoScanning}
          className="gap-2"
        >
          {autoScanning ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Scanning... {Math.round(scanProgress)}%</>
          ) : (
            <><Scan className="h-4 w-4" /> Scan Templates</>
          )}
        </Button>
      </div>

      {autoScanning && (
        <div className="p-4 rounded-xl glass space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Analyzing templates with AI...
            </span>
            <span className="text-muted-foreground">{Math.round(scanProgress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, industry, app..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 glass"
          />
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5", viewMode === "grid" ? "bg-accent" : "text-muted-foreground")}>
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("p-1.5", viewMode === "list" ? "bg-accent" : "text-muted-foreground")}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="glass">
          <TabsTrigger value="all" className="text-xs">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="automation-templates" className="text-xs">Automation</TabsTrigger>
          <TabsTrigger value="marketing-ai" className="text-xs">Marketing</TabsTrigger>
          <TabsTrigger value="ai-workflows" className="text-xs">Workflows</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground">Try different search terms or filters.</p>
        </div>
      ) : (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3")}>
          {filtered.map((template) => (
            <Card key={template.id} className="glass group hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className={viewMode === "grid" ? "p-4 space-y-3" : "p-4 flex gap-4"}>
                {viewMode === "list" && (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className={viewMode === "list" ? "flex-1 min-w-0" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate">{template.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {template.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] gap-0.5">
                      <Download className="h-2.5 w-2.5" /> {template.importCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    {template.industry.slice(0, 2).map((ind) => (
                      <span key={ind}>{ind}</span>
                    ))}
                    <span>{template.difficulty}</span>
                    <span>v{template.version}</span>
                  </div>
                  {viewMode === "list" && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {template.apps.slice(0, 3).map((app) => (
                        <Badge key={app} variant="outline" className="text-[10px]">{app}</Badge>
                      ))}
                      {template.apps.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{template.apps.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
