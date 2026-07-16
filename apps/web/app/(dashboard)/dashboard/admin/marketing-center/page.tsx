"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Mail, Globe, Video, Search,
  BarChart3, Users, TrendingUp, Target,
  Send, Plus, Edit3, Trash2, Eye,
  CheckCircle2, AlertCircle, Clock, Sparkles,
  FileText, Share2, MessageSquare,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

const campaigns = [
  { name: "Summer Sale 2025", status: "active", sent: 12450, opens: 38, clicks: 12, conversions: 345 },
  { name: "New Feature Launch", status: "active", sent: 8900, opens: 42, clicks: 18, conversions: 567 },
  { name: "Q3 Newsletter", status: "scheduled", sent: 0, opens: 0, clicks: 0, conversions: 0 },
  { name: "Customer Winback", status: "draft", sent: 0, opens: 0, clicks: 0, conversions: 0 },
  { name: "Product Update v3", status: "completed", sent: 15200, opens: 45, clicks: 22, conversions: 1234 },
];

const keywords = [
  { keyword: "AI real estate", volume: 12400, difficulty: 68, traffic: 3400 },
  { keyword: "real estate automation", volume: 8900, difficulty: 45, traffic: 2100 },
  { keyword: "AI sales agent", volume: 6700, difficulty: 52, traffic: 1800 },
  { keyword: "property AI tools", volume: 3400, difficulty: 28, traffic: 890 },
];

export default function MarketingCenterPage() {
  const [platform, setPlatform] = useState("twitter");
  const [postTopic, setPostTopic] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");

  const generatePost = () => {
    if (!postTopic) return;
    setTimeout(() => {
      setGeneratedPost(`🚀 Exciting news about ${postTopic}!\n\nOur AI-powered solution is transforming how real estate professionals work. Here's what you need to know:\n\n1. Automate repetitive tasks\n2. Generate quality leads\n3. Close deals faster\n\nLearn more at buildagent.com\n\n#AI #RealEstate #BuildAgent`);
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Marketing Center"
          description="Campaign management, content generation, and analytics."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Marketing Center" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Megaphone className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">5 total</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Mail className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">36,550</p><p className="text-xs text-muted-foreground">This month</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Open Rate</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">41.7%</p><p className="text-xs text-emerald-500">+3.2% vs last month</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Target className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">2,146</p><p className="text-xs text-muted-foreground">2.1% conversion rate</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="campaigns"><Megaphone className="h-4 w-4 mr-1" />Campaigns</TabsTrigger>
            <TabsTrigger value="social"><Share2 className="h-4 w-4 mr-1" />Social</TabsTrigger>
            <TabsTrigger value="keywords"><Search className="h-4 w-4 mr-1" />Keywords</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Management</CardTitle>
                  <Button variant="glass" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />New Campaign</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Campaign</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Sent</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Opens</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Clicks</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Conv</th>
                        <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <motion.tr key={c.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 font-medium">{c.name}</td>
                          <td className="py-3"><Badge variant={c.status === "active" ? "success" : c.status === "scheduled" ? "secondary" : c.status === "draft" ? "warning" : "outline"}>{c.status}</Badge></td>
                          <td className="py-3 text-muted-foreground">{c.sent.toLocaleString()}</td>
                          <td className="py-3 text-muted-foreground">{c.opens}%</td>
                          <td className="py-3 text-muted-foreground">{c.clicks}%</td>
                          <td className="py-3 font-medium">{c.conversions.toLocaleString()}</td>
                          <td className="py-3 text-right"><Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5" /></Button></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader><CardTitle>Social Media Post Generator</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {["twitter", "linkedin", "facebook"].map((p) => (
                        <button key={p} onClick={() => setPlatform(p)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${platform === p ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                    <Input placeholder="Post topic..." value={postTopic} onChange={(e) => setPostTopic(e.target.value)} />
                    <Button variant="glass" className="gap-2" onClick={generatePost}><Sparkles className="h-4 w-4" />Generate Post</Button>
                    {generatedPost && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <pre className="text-sm whitespace-pre-wrap">{generatedPost}</pre>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader><CardTitle>Video Script Generator</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  <div className="space-y-2"><Label>Video Topic</Label><Input placeholder="Product demo, tutorial, etc." /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Duration</Label>
                        <Select defaultValue="60">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="30">30 seconds</SelectItem><SelectItem value="60">60 seconds</SelectItem><SelectItem value="120">2 minutes</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Tone</Label>
                        <Select defaultValue="professional">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="enthusiastic">Enthusiastic</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="glass" className="gap-2"><Video className="h-4 w-4" />Generate Script</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Keyword Research</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search keywords..." className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Keyword</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Volume</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Difficulty</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Traffic</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Opportunity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((kw) => (
                        <tr key={kw.keyword} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium">{kw.keyword}</td>
                          <td className="py-3 text-muted-foreground">{kw.volume.toLocaleString()}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={kw.difficulty} className="w-16 h-1.5" />
                              <span className={`text-xs font-medium ${kw.difficulty > 60 ? "text-red-500" : kw.difficulty > 40 ? "text-amber-500" : "text-emerald-500"}`}>{kw.difficulty}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{kw.traffic.toLocaleString()}</td>
                          <td className="py-3"><Badge variant={kw.difficulty < 50 ? "success" : "warning"}>{kw.difficulty < 50 ? "High" : "Medium"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="glass">
              <CardHeader><CardTitle>Analytics Overview</CardTitle><CardDescription>Marketing performance metrics</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2"><Mail className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium">Email Performance</span></div>
                    <p className="text-2xl font-bold">41.7%</p>
                    <p className="text-xs text-muted-foreground">Open rate (avg)</p>
                    <div className="mt-2"><Progress value={41.7} className="h-1.5" /></div>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-to-br from-violet-500/5 to-transparent border border-border">
                    <div className="flex items-center gap-2 mb-2"><Share2 className="h-4 w-4 text-violet-500" /><span className="text-sm font-medium">Social Reach</span></div>
                    <p className="text-2xl font-bold">124.5K</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="text-xs text-emerald-500 mt-1">+23% vs last month</p>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-500/5 to-transparent border border-border">
                    <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-emerald-500" /><span className="text-sm font-medium">Conversion Rate</span></div>
                    <p className="text-2xl font-bold">2.1%</p>
                    <p className="text-xs text-muted-foreground">Campaign avg</p>
                    <div className="mt-2"><Progress value={2.1} max={5} className="h-1.5" /></div>
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