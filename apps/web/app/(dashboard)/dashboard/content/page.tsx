"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, Save, Eye, Download,
  CheckCircle2, Clock, Plus, Search, Globe,
  BookOpen, Send, DollarSign,
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

const contentItems = [
  { id: 1, title: "AI in Real Estate - Landing Page", type: "Landing Page", status: "published", date: "2h ago" },
  { id: 2, title: "How AI Employees Boost Sales", type: "Blog Post", status: "published", date: "1d ago" },
  { id: 3, title: "Top 10 Real Estate Trends", type: "Article", status: "draft", date: "3d ago" },
  { id: 4, title: "Q4 Newsletter", type: "Email", status: "published", date: "1w ago" },
  { id: 5, title: "Case Study: 3x Conversion", type: "Case Study", status: "draft", date: "2w ago" },
];

export default function ContentPage() {
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerate = () => {
    if (!topic) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`# ${topic}\n\n## Key Takeaways\n\nThis content explores how AI is transforming real estate, helping professionals automate tasks and close deals faster.\n\n## Main Points\n\n- Reduce manual work by up to 70%\n- Increase lead conversion by 3x\n- Scale personalized outreach\n\n## Conclusion\n\nAI-powered tools are essential for modern real estate professionals.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Content Studio"
          description="Generate and manage your AI-powered content."
          breadcrumbs={[{ label: "Content" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Generate Content</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Content Type</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { value: "landing_page", label: "Landing", icon: Globe },
                      { value: "blog", label: "Blog", icon: FileText },
                      { value: "email", label: "Email", icon: Send },
                      { value: "article", label: "Article", icon: BookOpen },
                    ].map((ct) => (
                      <button key={ct.value} onClick={() => setContentType(ct.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                          contentType === ct.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                        }`}>
                        <ct.icon className="h-5 w-5" />
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Topic or Keywords</Label>
                  <Input placeholder="e.g., AI lead generation" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1" />
                </div>
                <Button variant="glass" className="gap-2 w-full" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
                {generatedContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <pre className="text-sm whitespace-pre-wrap">{generatedContent}</pre>
                    <div className="flex gap-2 mt-4">
                      <Button variant="default" size="sm" className="gap-1"><Save className="h-3.5 w-3.5" />Save</Button>
                      <Button variant="glass" size="sm" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Your Content</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                        <Badge variant={item.status === "published" ? "success" : "warning"} className="text-[10px]">{item.status}</Badge>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}