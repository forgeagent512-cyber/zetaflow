"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Users,
  Target,
  Loader2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: "high" | "medium" | "low";
  intent: "informational" | "commercial" | "transactional" | "navigational";
}

export default function KeywordResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [activeTab, setActiveTab] = useState("discovery");

  const searchKeywords = () => {
    if (!searchQuery) return;
    setSearching(true);
    setTimeout(() => {
      const baseKw = searchQuery.toLowerCase();
      setKeywords([
        { keyword: baseKw, volume: 12400, difficulty: 72, opportunity: "medium", intent: "informational" },
        { keyword: `best ${baseKw}`, volume: 8900, difficulty: 65, opportunity: "high", intent: "commercial" },
        { keyword: `${baseKw} pricing`, volume: 5400, difficulty: 48, opportunity: "high", intent: "transactional" },
        { keyword: `${baseKw} vs competitors`, volume: 3200, difficulty: 41, opportunity: "high", intent: "commercial" },
        { keyword: `how to ${baseKw}`, volume: 8100, difficulty: 38, opportunity: "high", intent: "informational" },
        { keyword: `${baseKw} tools`, volume: 6700, difficulty: 55, opportunity: "medium", intent: "commercial" },
        { keyword: `${baseKw} examples`, volume: 4400, difficulty: 35, opportunity: "high", intent: "informational" },
        { keyword: `${baseKw} guide`, volume: 5600, difficulty: 42, opportunity: "high", intent: "informational" },
        { keyword: `cheap ${baseKw}`, volume: 2800, difficulty: 58, opportunity: "medium", intent: "transactional" },
        { keyword: `${baseKw} software`, volume: 9200, difficulty: 68, opportunity: "medium", intent: "commercial" },
        { keyword: `${baseKw} 2026`, volume: 3800, difficulty: 31, opportunity: "high", intent: "informational" },
        { keyword: `online ${baseKw}`, volume: 6100, difficulty: 52, opportunity: "high", intent: "commercial" },
      ]);
      setSearching(false);
    }, 1500);
  };

  const getDifficultyColor = (d: number) => {
    if (d < 40) return "text-emerald-500";
    if (d < 60) return "text-amber-500";
    return "text-red-500";
  };

  const getDifficultyBg = (d: number) => {
    if (d < 40) return "bg-emerald-500";
    if (d < 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getIntentColor = (i: string) => {
    switch (i) {
      case "informational": return "bg-blue-500/10 text-blue-500";
      case "commercial": return "bg-purple-500/10 text-purple-500";
      case "transactional": return "bg-emerald-500/10 text-emerald-500";
      case "navigational": return "bg-amber-500/10 text-amber-500";
      default: return "";
    }
  };

  const longTailVariations = searchQuery
    ? [
        `best ${searchQuery} for beginners`,
        `${searchQuery} for small business`,
        `affordable ${searchQuery} solutions`,
        `enterprise ${searchQuery} platform`,
        `${searchQuery} with AI features`,
      ]
    : [];

  const questionsFromKeyword = searchQuery
    ? [
        `What is ${searchQuery}?`,
        `How does ${searchQuery} work?`,
        `Why is ${searchQuery} important?`,
        `How much does ${searchQuery} cost?`,
        `What are the benefits of ${searchQuery}?`,
      ]
    : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Keyword Research"
          description="Discover and analyze keywords for your content strategy."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Keyword Research" }]}
        />

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a keyword to research..."
                className="flex-1"
                icon={<Search className="h-4 w-4" />}
                onKeyDown={(e) => e.key === "Enter" && searchKeywords()}
              />
              <Button onClick={searchKeywords} disabled={searching || !searchQuery} className="gap-2">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="glass">
              <TabsTrigger value="discovery">Keyword Discovery</TabsTrigger>
              <TabsTrigger value="longtail">Long-Tail Variations</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="competition">Competition Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Keyword Results for "{searchQuery}"</CardTitle>
                  <CardDescription>{keywords.length} keywords found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Keyword</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Volume</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Difficulty</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Opportunity</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Intent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywords.map((kw, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-medium">{kw.keyword}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span>{kw.volume.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div className={`h-full rounded-full ${getDifficultyBg(kw.difficulty)}`} style={{ width: `${kw.difficulty}%` }} />
                                </div>
                                <span className={getDifficultyColor(kw.difficulty)}>{kw.difficulty}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={kw.opportunity === "high" ? "success" : kw.opportunity === "medium" ? "warning" : "secondary"}>
                                {kw.opportunity}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getIntentColor(kw.intent)}`}>
                                {kw.intent}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="longtail">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Long-Tail Keyword Variations</CardTitle>
                  <CardDescription>Longer, more specific keyword phrases.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {longTailVariations.map((variation, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">{variation}</span>
                        </div>
                        <Badge variant="success">High Opportunity</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Questions from "{searchQuery}"</CardTitle>
                  <CardDescription>Questions people ask related to your keyword.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {questionsFromKeyword.map((q, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                        <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="text-sm">{q}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competition">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Competition Analysis</CardTitle>
                  <CardDescription>Analyze the competitive landscape for "{searchQuery}".</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Top Competing Pages</h4>
                      {[
                        { url: "example.com/guide", score: 85, backlinks: 1200 },
                        { url: "competitor.com/resources", score: 78, backlinks: 890 },
                        { url: "industry-blog.com/post", score: 72, backlinks: 650 },
                      ].map((comp, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5">
                          <p className="text-sm font-mono">{comp.url}</p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            <span>DA: {comp.score}</span>
                            <span>Backlinks: {comp.backlinks}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Recommendations</h4>
                      <div className="space-y-2">
                        {[
                          "Target long-tail variations for quicker wins",
                          "Create comprehensive guides to compete",
                          "Build backlinks through guest posting",
                          "Optimize for featured snippets",
                          "Improve page load speed for better ranking",
                        ].map((rec, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                            <Target className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {keywords.length === 0 && !searching && (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Enter a keyword above to start researching</p>
              <p className="text-xs mt-1">Get volumes, difficulty scores, and opportunities</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
