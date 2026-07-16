"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Plus, BarChart3, Eye, TrendingUp,
  Target, Send, CheckCircle2, Clock, Users,
  DollarSign, Activity,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  { name: "Summer Sale", status: "active", sent: 2450, opens: 38, clicks: 12 },
  { name: "New Feature Launch", status: "active", sent: 1890, opens: 42, clicks: 18 },
  { name: "Q3 Newsletter", status: "scheduled", sent: 0, opens: 0, clicks: 0 },
  { name: "Customer Winback", status: "draft", sent: 0, opens: 0, clicks: 0 },
];

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Campaigns"
          description="Manage your marketing campaigns."
          breadcrumbs={[{ label: "Campaigns" }]}
          actions={<Button variant="glass" size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5" />Create Campaign</Button>}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Megaphone className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">4 total</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Send className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">4,340</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Open Rate</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">40%</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Target className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">345</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant={c.status === "active" ? "success" : c.status === "scheduled" ? "secondary" : "warning"}>{c.status}</Badge>
                        <span>{c.sent} sent</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{c.opens}% opens</Badge>
                      <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Analytics</CardTitle><CardDescription>Campaign performance overview</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-border">
                  <div className="flex items-center gap-2 mb-2"><Activity className="h-4 w-4 text-primary" /><span className="font-medium">Performance Summary</span></div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Open Rate</span><span className="font-medium">40.0%</span></div>
                    <div className="h-1.5 rounded-full bg-muted"><div className="h-full w-2/5 rounded-full bg-primary" /></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Click Rate</span><span className="font-medium">15.0%</span></div>
                    <div className="h-1.5 rounded-full bg-muted"><div className="h-full w-[15%] rounded-full bg-primary" /></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Conversion Rate</span><span className="font-medium">7.2%</span></div>
                    <div className="h-1.5 rounded-full bg-muted"><div className="h-full w-[7%] rounded-full bg-emerald-500" /></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <div><p className="text-sm font-medium">Reach</p><p className="text-xs text-muted-foreground">8,900 unique recipients</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

