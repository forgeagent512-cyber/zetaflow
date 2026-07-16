"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket, CheckCircle2, XCircle, AlertTriangle,
  Shield, Globe, FileText, Download, RefreshCw,
  ChevronRight, BarChart3, ListChecks, ArrowRight,
  Loader2, Sparkles, Activity,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const checklistItems = [
  { title: "SSL Certificate configured", status: "passed" },
  { title: "Database migrations completed", status: "passed" },
  { title: "Environment variables set", status: "passed" },
  { title: "CDN configured", status: "passed" },
  { title: "API rate limits configured", status: "passed" },
  { title: "Monitoring alerts set up", status: "passed" },
  { title: "Backup schedule configured", status: "warning" },
  { title: "Load testing completed", status: "failed" },
  { title: "Documentation updated", status: "warning" },
  { title: "Staging environment synced", status: "passed" },
];

const healthChecks = [
  { name: "Web Server", status: "passed", latency: "45ms" },
  { name: "API Gateway", status: "passed", latency: "32ms" },
  { name: "Database", status: "passed", latency: "12ms" },
  { name: "Redis Cache", status: "passed", latency: "3ms" },
  { name: "Queue Worker", status: "warning", latency: "120ms" },
  { name: "Email Service", status: "passed", latency: "210ms" },
];

const securityChecks = [
  { name: "XSS Protection", status: "passed" },
  { name: "CSRF Protection", status: "passed" },
  { name: "Rate Limiting", status: "passed" },
  { name: "SQL Injection", status: "passed" },
  { name: "Auth Headers", status: "warning" },
  { name: "Dependency Audit", status: "failed" },
];

export default function LaunchCenterPage() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const passedHealth = healthChecks.filter(c => c.status === "passed").length;
  const completed = checklistItems.filter(c => c.status === "passed").length;
  const totalChecks = checklistItems.length;
  const readiness = Math.round((passedHealth / healthChecks.length) * 70 + (completed / totalChecks) * 30);

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Launch Center"
          description="Pre-flight checks, readiness, and launch reports."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Launch Center" }]}
          actions={
            <Button variant="glass" className="gap-2" onClick={() => { setIsGeneratingReport(true); setTimeout(() => setIsGeneratingReport(false), 2500); }}>
              {isGeneratingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {isGeneratingReport ? "Generating..." : "Launch Report"}
            </Button>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Readiness Score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <svg className="absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                        className={readiness >= 80 ? "text-emerald-500" : readiness >= 60 ? "text-amber-500" : "text-red-500"}
                        strokeDasharray={`${readiness * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <span className="text-lg font-bold">{readiness}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{readiness >= 80 ? "Ready to launch" : "Needs attention"}</p>
                    <p className="text-xs text-muted-foreground">{passedHealth}/{healthChecks.length} health checks pass</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Checklist Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-2"><ListChecks className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{completed}/{totalChecks}</p><p className="text-xs text-muted-foreground">Tasks completed</p></div></div>
                <Progress value={(completed / totalChecks) * 100} className="h-1.5" />
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Health Checks</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3"><Activity className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{passedHealth}/6</p><p className="text-xs text-muted-foreground">Passed</p></div></div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Security</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3"><Shield className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">{securityChecks.filter(s => s.status === "passed").length}/6</p><p className="text-xs text-muted-foreground">Checks passed</p></div></div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle>Launch Checklist</CardTitle><CardDescription>Pre-launch verification</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklistItems.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    {item.status === "passed" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> :
                     item.status === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> :
                     <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                    <span className="text-sm flex-1">{item.title}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Health Checks</CardTitle><CardDescription>System health verification</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthChecks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      {check.status === "passed" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      <span className="text-sm">{check.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{check.latency}</span>
                      <Badge variant={check.status === "passed" ? "success" : "warning"} className="text-[10px]">{check.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Security Checks</CardTitle><CardDescription>Security verification</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityChecks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      {check.status === "passed" ? <Shield className="h-4 w-4 text-emerald-500" /> :
                       check.status === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
                       <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">{check.name}</span>
                    </div>
                    <Badge variant={check.status === "passed" ? "success" : check.status === "warning" ? "warning" : "destructive"} className="text-[10px]">{check.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">SEO Readiness</span><Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Ready</Badge></div>
                <p className="text-xs text-muted-foreground">All meta tags, sitemap, and robots.txt configured.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}