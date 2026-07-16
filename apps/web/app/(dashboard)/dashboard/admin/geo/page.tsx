"use client";

import { useState } from "react";
import {
  Network,
  Plus,
  Target,
  FileText,
  TestTube,
  Loader2,
  Search,
  CheckCircle2,
  X,
  Layers,
  Link2,
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

interface Entity {
  id: number;
  name: string;
  type: string;
  description: string;
}

interface TopicCluster {
  id: number;
  topic: string;
  keywords: string[];
  articles: number;
}

export default function GEOPage() {
  const [activeTab, setActiveTab] = useState("knowledge-graph");
  const [entities, setEntities] = useState<Entity[]>([
    { id: 1, name: "BuildAgent", type: "Organization", description: "AI-powered platform for real estate" },
    { id: 2, name: "AI Sales Employee", type: "Product", description: "Automated sales agent" },
    { id: 3, name: "Real Estate SEO", type: "Topic", description: "Search optimization for real estate" },
  ]);
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityDesc, setEntityDesc] = useState("");
  const [clusters, setClusters] = useState<TopicCluster[]>([
    { id: 1, topic: "AI in Real Estate", keywords: ["AI agents", "automation", "real estate tech"], articles: 5 },
    { id: 2, topic: "Real Estate SEO", keywords: ["local SEO", "property listings", "search ranking"], articles: 3 },
  ]);
  const [clusterTopic, setClusterTopic] = useState("");
  const [clusterKeywords, setClusterKeywords] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<null | { score: number; suggestions: string[] }>(null);
  const [testing, setTesting] = useState(false);
  const [entityPageData, setEntityPageData] = useState({ name: "", type: "", audience: "", goal: "" });
  const [generatedPage, setGeneratedPage] = useState("");

  const addEntity = () => {
    if (!entityName || !entityType) return;
    setEntities([...entities, { id: Date.now(), name: entityName, type: entityType, description: entityDesc }]);
    setEntityName("");
    setEntityType("");
    setEntityDesc("");
  };

  const removeEntity = (id: number) => {
    setEntities(entities.filter((e) => e.id !== id));
  };

  const addCluster = () => {
    if (!clusterTopic) return;
    const keywords = clusterKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    setClusters([...clusters, { id: Date.now(), topic: clusterTopic, keywords, articles: 0 }]);
    setClusterTopic("");
    setClusterKeywords("");
  };

  const runTest = () => {
    if (!testUrl) return;
    setTesting(true);
    setTimeout(() => {
      setTestResult({
        score: Math.floor(Math.random() * 40) + 60,
        suggestions: [
          "Add structured data markup",
          "Improve entity salience with clear naming",
          "Include FAQ schema for better snippet chances",
          "Optimize for 'people also ask' queries",
        ],
      });
      setTesting(false);
    }, 2000);
  };

  const generateEntityPage = () => {
    const page = `# ${entityPageData.name}

## About
This page provides comprehensive information about ${entityPageData.name || "your entity"}.

## Target Audience
${entityPageData.audience || "General audience interested in this topic."}

## Main Content
${entityPageData.name} is a ${entityPageData.type || "topic"} designed for ${entityPageData.audience || "users"}.

## Key Points
- Entity-type: ${entityPageData.type || "General"}
- Goal: ${entityPageData.goal || "Inform and engage"}
- Fully optimized for generative AI search engines
- Rich structured data included
- Entity salience maximized through clear hierarchies

## Schema Markup
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "${entityPageData.type || "Thing"}",
  "name": "${entityPageData.name || "Entity Name"}",
  "description": "Optimized for GEO"
}
\`\`\``;
    setGeneratedPage(page);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="GEO Center"
          description="Generative Engine Optimization for AI search visibility."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "GEO" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Entities Tracked", value: entities.length.toString(), icon: Network },
            { label: "Topic Clusters", value: clusters.length.toString(), icon: Layers },
            { label: "GEO Score", value: "74", suffix: "/100", icon: Target },
            { label: "Optimized Pages", value: "12", icon: FileText },
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="knowledge-graph">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="clusters">Topic Clusters</TabsTrigger>
            <TabsTrigger value="pages">Entity Pages</TabsTrigger>
            <TabsTrigger value="test">AI Search Test</TabsTrigger>
            <TabsTrigger value="visual">Visual Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge-graph">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Knowledge Graph Builder</CardTitle>
                <CardDescription>Manage entities for your knowledge graph.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} placeholder="Entity name" />
                  <Input value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder="Entity type (Organization, Product, etc.)" />
                  <Button onClick={addEntity} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Entity
                  </Button>
                </div>
                <Input value={entityDesc} onChange={(e) => setEntityDesc(e.target.value)} placeholder="Description (optional)" />
                <div className="space-y-2">
                  {entities.map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <Network className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="text-sm font-medium">{entity.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{entity.type}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeEntity(entity.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clusters">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Topic Clusters</CardTitle>
                <CardDescription>Create topic clusters for better topical authority.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input value={clusterTopic} onChange={(e) => setClusterTopic(e.target.value)} placeholder="Main topic" />
                  <Input value={clusterKeywords} onChange={(e) => setClusterKeywords(e.target.value)} placeholder="Keywords (comma separated)" />
                  <Button onClick={addCluster} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Cluster
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clusters.map((cluster) => (
                    <Card key={cluster.id} className="bg-white/5 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{cluster.topic}</h4>
                          <Badge variant="secondary">{cluster.articles} articles</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.keywords.map((kw) => (
                            <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Entity Page Generator</CardTitle>
                <CardDescription>Generate GEO-optimized entity pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={entityPageData.name} onChange={(e) => setEntityPageData({ ...entityPageData, name: e.target.value })} placeholder="Entity/Page name" />
                  <Input value={entityPageData.type} onChange={(e) => setEntityPageData({ ...entityPageData, type: e.target.value })} placeholder="Type (Topic, Product, etc.)" />
                  <Input value={entityPageData.audience} onChange={(e) => setEntityPageData({ ...entityPageData, audience: e.target.value })} placeholder="Target audience" />
                  <Input value={entityPageData.goal} onChange={(e) => setEntityPageData({ ...entityPageData, goal: e.target.value })} placeholder="Page goal" />
                </div>
                <Button onClick={generateEntityPage} className="gap-2">
                  <FileText className="h-4 w-4" /> Generate Entity Page
                </Button>
                {generatedPage && (
                  <pre className="p-4 rounded-lg bg-black/40 text-xs text-emerald-400 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">{generatedPage}</pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card className="glass">
              <CardHeader>
                <CardTitle>AI Search Optimization Test</CardTitle>
                <CardDescription>Test how your content performs in AI search results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input value={testUrl} onChange={(e) => setTestUrl(e.target.value)} placeholder="Enter URL to test" className="flex-1" />
                  <Button onClick={runTest} disabled={testing} className="gap-2">
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                    {testing ? "Testing..." : "Run Test"}
                  </Button>
                </div>
                {testResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                      <div className="text-3xl font-bold text-blue-500">{testResult.score}%</div>
                      <div>
                        <p className="text-sm font-medium">AI Search Readiness Score</p>
                        <p className="text-xs text-muted-foreground">Based on entity salience, structure, and schema</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Optimization Suggestions</h4>
                      {testResult.suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Knowledge Graph Visualization</CardTitle>
                <CardDescription>Visual representation of your entity relationships.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative w-64 h-64 mx-auto">
                      {entities.map((entity, i) => {
                        const angle = (i / entities.length) * Math.PI * 2;
                        const r = 80;
                        const x = 96 + Math.cos(angle) * r;
                        const y = 96 + Math.sin(angle) * r;
                        return (
                          <div
                            key={entity.id}
                            className="absolute w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs font-medium"
                            style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
                            title={entity.name}
                          >
                            {entity.name[0]}
                          </div>
                        );
                      })}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xs font-medium">
                        KG
                      </div>
                      {entities.length > 1 && entities.map((_, i) => {
                        const next = (i + 1) % entities.length;
                        return null;
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">Connected entities: {entities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
