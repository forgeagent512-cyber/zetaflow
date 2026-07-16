"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Send, Save, Eye, Download,
  Sparkles, Globe, BookOpen, Mail, DollarSign,
  FileEdit, Users, TrendingUp, CheckCircle2,
  Clock, Plus, Search, ChevronRight,
  FileOutput, FileInput,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

const contentTypes = [
  { value: "landing_page", label: "Landing Page", icon: Globe },
  { value: "blog", label: "Blog Post", icon: FileText },
  { value: "article", label: "Article", icon: BookOpen },
  { value: "case_study", label: "Case Study", icon: FileEdit },
  { value: "email", label: "Email Campaign", icon: Send },
  { value: "sales_page", label: "Sales Page", icon: DollarSign },
  { value: "whitepaper", label: "Whitepaper", icon: FileText },
];

const industries = [
  "Real Estate", "Technology", "Healthcare", "Finance",
  "Education", "E-commerce", "Marketing", "Legal",
];

const contentHistory = [
  { id: 1, title: "AI in Real Estate - Landing Page", type: "landing_page", status: "published", date: "2h ago" },
  { id: 2, title: "How AI Employees Boost Sales", type: "blog", status: "published", date: "1d ago" },
  { id: 3, title: "Case Study: 3x Conversion Rate", type: "case_study", status: "draft", date: "3d ago" },
  { id: 4, title: "Q4 Email Campaign", type: "email", status: "published", date: "1w ago" },
  { id: 5, title: "Real Estate Tech Whitepaper", type: "whitepaper", status: "draft", date: "2w ago" },
];

export default function ContentStudioPage() {
  const [contentType, setContentType] = useState("blog");
  const [industry, setIndustry] = useState("");
  const [audience, setAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerate = () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedContent("");
    setTimeout(() => {
      const ct = contentTypes.find(c => c.value === contentType);
      setGeneratedContent(`# ${topic}\n\n## Executive Summary\n\nThis ${ct?.label.toLowerCase() || "content"} explores how AI is transforming the ${industry || "real estate"} industry, helping professionals automate repetitive tasks, generate leads, and close deals faster.\n\n## Key Insights\n\n- AI-powered tools can reduce manual work by up to 70%\n- Lead conversion rates increase by 3x with intelligent automation\n- Personalized outreach at scale becomes feasible\n\n## Target Audience\n\n${audience || "Real estate professionals seeking to leverage AI for competitive advantage."}\n\n## Conclusion\n\nThe future of ${industry || "real estate"} is AI-driven. Early adopters gain significant advantages in efficiency and revenue.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Content Studio"
          description="Generate AI-powered content for various formats and industries."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Content Studio" }]}
          actions={<Button variant="glass" size="sm" className="gap-1" onClick={() => setShowHistory(!showHistory)}><Clock className="h-3.5 w-3.5" />History</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Generate Content</CardTitle><CardDescription>Choose type, industry, and topic</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Content Type</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {contentTypes.slice(0, 4).map((ct) => (
                        <button key={ct.value}
                          onClick={() => setContentType(ct.value)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                            contentType === ct.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                          }`}>
                          <ct.icon className="h-5 w-5" />
                          {ct.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>{industries.map(i => (<SelectItem key={i} value={i}>{i}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Target Audience</Label>
                      <Input placeholder="e.g., Real estate agents" value={audience} onChange={(e) => setAudience(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Topic / Keywords</Label>
                    <Input placeholder="e.g., AI-powered lead generation" value={topic} onChange={(e) => setTopic(e.target.value)} />
                  </div>
                  <Button variant="glass" className="gap-2 w-full" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {generatedContent && (
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div><CardTitle>Generated Preview</CardTitle><CardDescription>Review and save your content</CardDescription></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{generatedContent}</pre>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="default" size="sm" className="gap-1"><Save className="h-3.5 w-3.5" />Save as Draft</Button>
                    <Button variant="glass" size="sm" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {showHistory && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass">
                <CardHeader><CardTitle>Content History</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentHistory.map((ch) => (
                      <div key={ch.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border">
                        <p className="text-sm font-medium truncate">{ch.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{contentTypes.find(ct => ct.value === ch.type)?.label}</Badge>
                          <Badge variant={ch.status === "published" ? "success" : "warning"} className="text-[10px]">{ch.status}</Badge>
                          <span>{ch.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}