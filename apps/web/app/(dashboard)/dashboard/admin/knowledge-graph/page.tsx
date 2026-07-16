"use client";

import { useState } from "react";
import {
  Network,
  Plus,
  X,
  Link2,
  Layers,
  Target,
  Globe,
  BookOpen,
  Zap,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface GraphEntity {
  id: number;
  name: string;
  type: string;
  category: string;
  description: string;
  relationships: number[];
}

interface Relationship {
  id: number;
  source: number;
  target: number;
  type: string;
}

export default function KnowledgeGraphPage() {
  const [activeTab, setActiveTab] = useState("entities");
  const [entities, setEntities] = useState<GraphEntity[]>([
    { id: 1, name: "BuildAgent", type: "Platform", category: "Product", description: "AI real estate platform", relationships: [2, 3] },
    { id: 2, name: "Real Estate", type: "Industry", category: "Market", description: "Real estate sector", relationships: [1, 3] },
    { id: 3, name: "AI Sales Agent", type: "Feature", category: "Product", description: "AI-powered sales", relationships: [1, 2] },
    { id: 4, name: "Property Listings", type: "Data", category: "Content", description: "Property data", relationships: [2] },
    { id: 5, name: "Lead Generation", type: "Process", category: "Business", description: "Lead gen process", relationships: [3] },
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: 1, source: 1, target: 2, type: "operates_in" },
    { id: 2, source: 1, target: 3, type: "provides" },
    { id: 3, source: 2, target: 4, type: "contains" },
    { id: 4, source: 3, target: 5, type: "enables" },
  ]);
  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityType, setNewEntityType] = useState("");
  const [newEntityCategory, setNewEntityCategory] = useState("");
  const [newRelSource, setNewRelSource] = useState("");
  const [newRelTarget, setNewRelTarget] = useState("");
  const [newRelType, setNewRelType] = useState("");

  const addEntity = () => {
    if (!newEntityName) return;
    setEntities([...entities, {
      id: Date.now(),
      name: newEntityName,
      type: newEntityType || "Concept",
      category: newEntityCategory || "General",
      description: "",
      relationships: [],
    }]);
    setNewEntityName("");
    setNewEntityType("");
    setNewEntityCategory("");
  };

  const removeEntity = (id: number) => {
    setEntities(entities.filter((e) => e.id !== id));
    setRelationships(relationships.filter((r) => r.source !== id && r.target !== id));
  };

  const addRelationship = () => {
    const sourceId = parseInt(newRelSource);
    const targetId = parseInt(newRelTarget);
    if (!sourceId || !targetId || !newRelType) return;
    setRelationships([...relationships, { id: Date.now(), source: sourceId, target: targetId, type: newRelType }]);
    setNewRelSource("");
    setNewRelTarget("");
    setNewRelType("");
  };

  const removeRelationship = (id: number) => {
    setRelationships(relationships.filter((r) => r.id !== id));
  };

  const getEntityName = (id: number) => entities.find((e) => e.id === id)?.name || "Unknown";

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Knowledge Graph"
          description="Build and visualize your knowledge graph."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Knowledge Graph" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Entities", value: entities.length.toString(), icon: Network },
            { label: "Relationships", value: relationships.length.toString(), icon: Link2 },
            { label: "Topics", value: entities.filter((e) => e.category === "Market").length.toString(), icon: Globe },
            { label: "Categories", value: [...new Set(entities.map((e) => e.category))].length.toString(), icon: Layers },
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
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="visual">Visual Map</TabsTrigger>
          </TabsList>

          <TabsContent value="entities">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Entity Management</CardTitle>
                <CardDescription>Add and manage knowledge graph entities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input value={newEntityName} onChange={(e) => setNewEntityName(e.target.value)} placeholder="Entity name" />
                  <Input value={newEntityType} onChange={(e) => setNewEntityType(e.target.value)} placeholder="Type" />
                  <Input value={newEntityCategory} onChange={(e) => setNewEntityCategory(e.target.value)} placeholder="Category" />
                  <Button onClick={addEntity} className="gap-2">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {entities.map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <Network className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="text-sm font-medium">{entity.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{entity.type}</Badge>
                          <Badge variant="secondary" className="ml-1 text-xs">{entity.category}</Badge>
                          <span className="text-xs text-muted-foreground ml-2">{entity.relationships.length} relations</span>
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

          <TabsContent value="relationships">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Relationship Manager</CardTitle>
                <CardDescription>Define connections between entities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input value={newRelSource} onChange={(e) => setNewRelSource(e.target.value)} placeholder="Source ID" type="number" />
                  <Input value={newRelTarget} onChange={(e) => setNewRelTarget(e.target.value)} placeholder="Target ID" type="number" />
                  <Input value={newRelType} onChange={(e) => setNewRelType(e.target.value)} placeholder="Type (e.g., relates_to)" />
                  <Button onClick={addRelationship} className="gap-2">
                    <Link2 className="h-4 w-4" /> Add Relation
                  </Button>
                </div>
                <div className="space-y-2">
                  {relationships.map((rel) => (
                    <div key={rel.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getEntityName(rel.source)}</Badge>
                        <span className="text-xs text-muted-foreground">--[{rel.type}]--&gt;</span>
                        <Badge variant="outline">{getEntityName(rel.target)}</Badge>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeRelationship(rel.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Knowledge Graph Visualization</CardTitle>
                <CardDescription>Visual mapping of entities and relationships.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5 relative overflow-hidden">
                  {entities.slice(0, 10).map((entity, i) => {
                    const angle = (i / Math.min(entities.length, 10)) * Math.PI * 2 - Math.PI / 2;
                    const cx = 400;
                    const cy = 250;
                    const r = Math.min(entities.length * 25 + 60, 180);
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    const colors = ["bg-blue-500/20 border-blue-500/50", "bg-purple-500/20 border-purple-500/50", "bg-emerald-500/20 border-emerald-500/50", "bg-amber-500/20 border-amber-500/50", "bg-rose-500/20 border-rose-500/50"];
                    return (
                      <div key={entity.id} className="absolute flex flex-col items-center" style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}>
                        <div className={`w-14 h-14 rounded-full ${colors[i % colors.length]} border-2 flex items-center justify-center text-lg font-bold`}>
                          {entity.name[0]}
                        </div>
                        <span className="text-[10px] mt-1 text-muted-foreground whitespace-nowrap">{entity.name}</span>
                      </div>
                    );
                  })}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-500/50 flex items-center justify-center mx-auto">
                      <Network className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Knowledge Graph</p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {[...new Set(entities.map((e) => e.category))].map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
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
