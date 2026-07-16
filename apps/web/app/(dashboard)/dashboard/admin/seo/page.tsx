"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  FileText,
  Globe,
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Gauge,
  RefreshCw,
  ArrowRight,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Settings,
  BarChart3,
  Copy,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pages = [
  { url: "/", title: "Home", metaDesc: "AI-powered real estate platform", score: 92, status: "good", keywords: "ai real estate" },
  { url: "/pricing", title: "Pricing", metaDesc: "Affordable AI solutions", score: 78, status: "needs-work", keywords: "pricing plans" },
  { url: "/features", title: "Features", metaDesc: "Explore our features", score: 85, status: "good", keywords: "ai features" },
  { url: "/blog", title: "Blog", metaDesc: "AI insights and news", score: 65, status: "needs-work", keywords: "ai blog" },
  { url: "/contact", title: "Contact", metaDesc: "Get in touch with us", score: 45, status: "poor", keywords: "contact us" },
];

const redirects = [
  { from: "/old-page", to: "/new-page", type: "301", hits: 1240 },
  { from: "/blog/old-post", to: "/blog/new-post", type: "301", hits: 856 },
  { from: "/temp-page", to: "/permanent-page", type: "302", hits: 342 },
];

const recommendations = [
  { issue: "Missing meta descriptions on 3 pages", impact: "high", fix: "Add unique meta descriptions" },
  { issue: "5 images missing alt text", impact: "medium", fix: "Add alt attributes to images" },
  { issue: "Slow page load (>3s) on /blog", impact: "high", fix: "Optimize images and enable caching" },
  { issue: "Broken internal links found", impact: "medium", fix: "Update or remove broken links" },
  { issue: "No schema markup on /pricing", impact: "low", fix: "Add Product schema" },
];

export default function SEOPage() {
  const [seoUrl, setSeoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [schemaType, setSchemaType] = useState("Organization");
  const [generatedSchema, setGeneratedSchema] = useState("");

  const runAnalysis = () => {
    if (!seoUrl) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setAnalysisResult("SEO Score: 72/100\n- Title tag: Found (55 chars)\n- Meta description: Found (145 chars)\n- H1 tag: Found\n- Open Graph: Missing\n- Canonical URL: Present\n- Robots.txt: Accessible\n- Schema.org markup: Missing");
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateSchema = () => {
    const schemas: Record<string, string> = {
      Organization: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "BUILDAGENT", url: "https://buildagent.com", logo: "https://buildagent.com/logo.png" }, null, 2),
      Product: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: "AI Employee", description: "AI-powered real estate sales employee", brand: "BUILDAGENT" }, null, 2),
      Article: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Article Title", author: "BUILDAGENT", datePublished: "2025-01-01" }, null, 2),
      FAQPage: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Question?", acceptedAnswer: { "@type": "Answer", text: "Answer." } }] }, null, 2),
    };
    setGeneratedSchema(schemas[schemaType] || schemas.Organization);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="SEO Center"
          description="Search engine optimization tools and management."
          breadcrumbs={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "SEO" },
          ]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <svg className="absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-500"
                        strokeDasharray={`${72 * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <span className="text-lg font-bold">72</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-emerald-500 font-medium">Good</p>
                    <p className="text-muted-foreground text-xs">+5 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Indexed Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-xs text-muted-foreground">+12 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Backlinks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Link2 className="h-8 w-8 text-violet-500" />
                  <div>
                    <p className="text-2xl font-bold">1,847</p>
                    <p className="text-xs text-muted-foreground">+89 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">3 critical</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerWrapper>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="pages"><FileText className="h-4 w-4 mr-1" />Pages</TabsTrigger>
            <TabsTrigger value="analysis"><Search className="h-4 w-4 mr-1" />Analysis</TabsTrigger>
            <TabsTrigger value="schema"><Code2 className="h-4 w-4 mr-1" />Schema</TabsTrigger>
            <TabsTrigger value="redirects"><Link2 className="h-4 w-4 mr-1" />Redirects</TabsTrigger>
            <TabsTrigger value="recommendations"><BarChart3 className="h-4 w-4 mr-1" />Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Page List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Search pages..." className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">URL</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Title</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Meta Description</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Score</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page) => (
                        <motion.tr key={page.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 font-medium">{page.url}</td>
                          <td className="py-3 text-muted-foreground">{page.title}</td>
                          <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{page.metaDesc}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={page.score} className="w-16 h-1.5" />
                              <span className={`text-xs font-medium ${
                                page.status === "good" ? "text-emerald-500" :
                                page.status === "needs-work" ? "text-amber-500" : "text-red-500"
                              }`}>{page.score}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="icon-sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>SEO Analysis Tool</CardTitle>
                <CardDescription>Analyze any URL for SEO issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="https://example.com/page"
                      value={seoUrl}
                      onChange={(e) => setSeoUrl(e.target.value)}
                      icon={<Globe className="h-4 w-4" />}
                    />
                  </div>
                  <Button variant="glass" className="gap-2" onClick={runAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                {analysisResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{analysisResult}</pre>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Schema Generator</CardTitle>
                <CardDescription>Generate structured data markup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Select value={schemaType} onValueChange={setSchemaType}>
                      <SelectTrigger><SelectValue placeholder="Schema type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organization">Organization</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="FAQPage">FAQ Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="glass" className="gap-2" onClick={generateSchema}>
                    <Code2 className="h-4 w-4" />
                    Generate
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(generatedSchema)}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                {generatedSchema && (
                  <pre className="p-4 rounded-lg bg-muted/50 border border-border text-xs font-mono overflow-x-auto">{generatedSchema}</pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redirects" className="mt-6">
            <Card className="glass">
              <CardHeader>
              <div className="flex items-center justify-between">
                  <CardTitle>Redirect Manager</CardTitle>
                  <Button variant="glass" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />Add Redirect</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">From</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">To</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Hits</th>
                        <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redirects.map((r) => (
                        <tr key={r.from} className="border-b border-border/50 last:border-0">
                          <td className="py-3 text-muted-foreground text-xs">{r.from}</td>
                          <td className="py-3 text-muted-foreground text-xs">{r.to}</td>
                          <td className="py-3"><Badge variant="outline">{r.type}</Badge></td>
                          <td className="py-3 text-muted-foreground">{r.hits.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable SEO improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        rec.impact === "high" ? "bg-red-500/10" :
                        rec.impact === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          rec.impact === "high" ? "text-red-500" :
                          rec.impact === "medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.issue}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Fix: {rec.fix}</p>
                      </div>
                      <Badge variant={rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "warning" : "secondary"}>
                        {rec.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}