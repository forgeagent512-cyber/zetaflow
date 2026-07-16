"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, TrendingUp, FileText, Globe,
  AlertTriangle, CheckCircle2, ExternalLink,
  BarChart3, ArrowUp, ArrowDown,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const pages = [
  { url: "/", title: "Home", score: 92, issues: 2 },
  { url: "/pricing", title: "Pricing", score: 78, issues: 5 },
  { url: "/features", title: "Features", score: 85, issues: 3 },
  { url: "/blog", title: "Blog", score: 65, issues: 8 },
  { url: "/contact", title: "Contact", score: 45, issues: 12 },
];

export default function ClientSEOPage() {
  const [seoUrl, setSeoUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const analyze = () => {
    if (!seoUrl) return;
    setTimeout(() => {
      setAnalysisResult("SEO Score: 72/100\n- Title tag: Found (55 chars)\n- Meta description: Found\n- H1 tag: Found\n- Internal links: 12\n- Load time: 2.3s");
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="SEO Dashboard"
          description="Monitor and improve your search engine optimization."
          breadcrumbs={[{ label: "SEO" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">SEO Score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <svg className="absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-500"
                        strokeDasharray="198 283" strokeLinecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <span className="text-lg font-bold">72</span>
                  </div>
                  <div><p className="text-sm font-medium text-emerald-500">Good</p><p className="text-xs text-muted-foreground">+5 this week</p></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Indexed Pages</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div><p className="text-2xl font-bold">247</p><p className="text-xs text-muted-foreground">+12 this week</p></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Issues Found</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <div><p className="text-2xl font-bold">28</p><p className="text-xs text-muted-foreground">5 critical</p></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Pages</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search..." className="h-8 w-40 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pages.map((page) => (
                  <div key={page.url} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{page.url}</p>
                      <p className="text-xs text-muted-foreground">{page.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Progress value={page.score} className="w-16 h-1.5" />
                        <span className={`text-xs font-medium ${page.score >= 80 ? "text-emerald-500" : page.score >= 60 ? "text-amber-500" : "text-red-500"}`}>{page.score}</span>
                      </div>
                      <Badge variant={page.issues === 0 ? "success" : page.issues > 5 ? "destructive" : "warning"} className="text-[10px]">{page.issues} issues</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>SEO Analyzer</CardTitle><CardDescription>Analyze any page</CardDescription></CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input type="text" placeholder="https://yoursite.com/page" value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <Button variant="glass" className="gap-2" onClick={analyze}><Search className="h-4 w-4" />Analyze</Button>
              </div>
              {analysisResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <pre className="text-xs whitespace-pre-wrap">{analysisResult}</pre>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}