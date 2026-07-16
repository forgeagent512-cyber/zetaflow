"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Building2,
  Globe,
  BarChart3,
  Users,
  Search,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Competitor {
  id: number;
  name: string;
  domain: string;
  da: number;
  traffic: string;
  keywords: number;
  topKeyword: string;
  trend: "up" | "down" | "stable";
}

export default function CompetitorDashboardPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: 1, name: "Competitor A", domain: "competitor-a.com", da: 72, traffic: "245K", keywords: 3400, topKeyword: "real estate AI", trend: "up" },
    { id: 2, name: "Competitor B", domain: "competitor-b.io", da: 65, traffic: "189K", keywords: 2800, topKeyword: "AI sales agent", trend: "down" },
    { id: 3, name: "Competitor C", domain: "comp-c.co", da: 58, traffic: "124K", keywords: 1900, topKeyword: "property automation", trend: "up" },
    { id: 4, name: "Competitor D", domain: "rival-d.com", da: 45, traffic: "87K", keywords: 1200, topKeyword: "real estate chatbot", trend: "stable" },
  ]);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const addCompetitor = () => {
    if (!newName || !newDomain) return;
    const newComp: Competitor = {
      id: Date.now(),
      name: newName,
      domain: newDomain,
      da: Math.floor(Math.random() * 50) + 20,
      traffic: `${Math.floor(Math.random() * 200) + 10}K`,
      keywords: Math.floor(Math.random() * 3000) + 200,
      topKeyword: "keyword",
      trend: "stable",
    };
    setCompetitors([...competitors, newComp]);
    setNewName("");
    setNewDomain("");
  };

  const removeCompetitor = (id: number) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Competitor Dashboard"
          description="Track and analyze your competitors."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Competitor Dashboard" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Competitors Tracked", value: competitors.length.toString(), icon: Building2 },
            { label: "Avg. Domain Authority", value: Math.round(competitors.reduce((a, c) => a + c.da, 0) / competitors.length).toString(), suffix: "/100", icon: BarChart3 },
            { label: "Total Keywords", value: competitors.reduce((a, c) => a + c.keywords, 0).toLocaleString(), icon: Search },
            { label: "Total Traffic", value: `${competitors.reduce((a, c) => a + parseInt(c.traffic), 0)}K`, icon: Users },
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

        <Card className="glass">
          <CardHeader>
            <CardTitle>Tracked Competitors</CardTitle>
            <CardDescription>Add and monitor your competitors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Competitor name" />
              <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="Domain (e.g., example.com)" />
              <Button onClick={addCompetitor} className="gap-2">
                <Plus className="h-4 w-4" /> Add Competitor
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Competitor</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Domain Authority</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Traffic</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Keywords</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Top Keyword</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trend</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((comp) => (
                    <tr key={comp.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{comp.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{comp.domain}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${comp.da}%` }} />
                          </div>
                          <span>{comp.da}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{comp.traffic}</td>
                      <td className="py-3 px-4">{comp.keywords.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-xs">{comp.topKeyword}</td>
                      <td className="py-3 px-4">
                        {comp.trend === "up" ? (
                          <Badge variant="success" className="gap-1"><TrendingUp className="h-3 w-3" /> Up</Badge>
                        ) : comp.trend === "down" ? (
                          <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" /> Down</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1"><Minus className="h-3 w-3" /> Stable</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => window.open(`https://${comp.domain}`, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeCompetitor(comp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Competitive Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Your domain authority is 10% higher than avg competitor",
                "You rank for 1,200 keywords your competitors don't",
                "Competitor A is gaining traffic from content marketing",
                "Competitor C has strong backlink profile from industry blogs",
              ].map((insight, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Increase content production to match Competitor A",
                "Build backlinks from real estate industry sites",
                "Target keywords where competitors have low authority",
                "Create comparison pages to capture competitor traffic",
              ].map((rec, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <BarChart3 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
