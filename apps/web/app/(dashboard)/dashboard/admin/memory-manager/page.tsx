"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Database, Clock, Trash2, Filter,
  Brain, MessageSquare, Layers, Activity,
  RefreshCw, AlertTriangle, CheckCircle2,
  Eye, EyeOff, Download, Zap,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

const conversations = [
  { id: 1, user: "Alice Johnson", messages: 24, type: "long-term", tokens: 12450, updated: "5m ago", context: "Business analysis" },
  { id: 2, user: "Bob Smith", messages: 12, type: "short-term", tokens: 6780, updated: "1h ago", context: "Workflow generation" },
  { id: 3, user: "Carol Davis", messages: 8, type: "conversation", tokens: 3450, updated: "3h ago", context: "Employee creation" },
  { id: 4, user: "Dave Wilson", messages: 32, type: "long-term", tokens: 18900, updated: "1d ago", context: "Agent configuration" },
  { id: 5, user: "Eve Miller", messages: 6, type: "conversation", tokens: 2100, updated: "2d ago", context: "Support request" },
];

export default function MemoryManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memoryFilter, setMemoryFilter] = useState("all");
  const [showCleanup, setShowCleanup] = useState(false);

  const filteredConversations = conversations.filter(c => {
    if (memoryFilter !== "all" && c.type !== memoryFilter) return false;
    if (searchQuery && !c.user.toLowerCase().includes(searchQuery.toLowerCase()) && !c.context.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalTokens = conversations.reduce((a, b) => a + b.tokens, 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Memory Manager"
          description="Manage conversation memory, context windows, and cleanup."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Memory Manager" }]}
          actions={
            <Button variant="destructive" size="sm" className="gap-1" onClick={() => setShowCleanup(true)}>
              <Trash2 className="h-3.5 w-3.5" />Cleanup Memory
            </Button>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><MessageSquare className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">5</p><p className="text-xs text-muted-foreground">Active sessions</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Database className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p><p className="text-xs text-muted-foreground">Context window</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Context Usage</CardTitle></CardHeader><CardContent><div><Progress value={42} className="h-2 mb-2" /><div className="flex justify-between text-xs"><span className="text-muted-foreground">42K / 100K</span><span className="text-muted-foreground">42%</span></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Memory Types</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Layers className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">LT / ST / Conv</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 w-44 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <Select value={memoryFilter} onValueChange={setMemoryFilter}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Memory type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="long-term">Long-term</SelectItem>
                        <SelectItem value="short-term">Short-term</SelectItem>
                        <SelectItem value="conversation">Conversation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Messages</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Tokens</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Context</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Updated</th>
                        <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConversations.map((conv) => (
                        <motion.tr key={conv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 font-medium">{conv.user}</td>
                          <td className="py-3">
                            <Badge variant={conv.type === "long-term" ? "default" : conv.type === "short-term" ? "secondary" : "outline"} className="text-[10px]">{conv.type}</Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">{conv.messages}</td>
                          <td className="py-3 font-mono text-xs">{conv.tokens.toLocaleString()}</td>
                          <td className="py-3 text-xs text-muted-foreground max-w-[120px] truncate">{conv.context}</td>
                          <td className="py-3 text-xs text-muted-foreground">{conv.updated}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5" /></Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Context Monitor</CardTitle><CardDescription>Real-time context usage</CardDescription></CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-border">
                  <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Context Window</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Used</span>
                      <span className="font-medium">42,000</span>
                    </div>
                    <Progress value={42} className="h-2.5" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>100,000 tokens</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Long-term</span><span className="font-medium">24,500</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Short-term</span><span className="font-medium">12,300</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Conversation</span><span className="font-medium">5,200</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="glass" className="w-full justify-start gap-2"><RefreshCw className="h-4 w-4" />Refresh Context</Button>
                <Button variant="glass" className="w-full justify-start gap-2"><Zap className="h-4 w-4" />Optimize Memory</Button>
                <Button variant="glass" className="w-full justify-start gap-2"><Download className="h-4 w-4" />Export Session</Button>
                <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => setShowCleanup(true)}><Trash2 className="h-4 w-4" />Cleanup Memory</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal open={showCleanup} onOpenChange={setShowCleanup}>
          <ModalContent>
            <ModalHeader><ModalTitle>Memory Cleanup</ModalTitle><ModalDescription>Clear old or unused conversations to free up context</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
              <p className="text-center text-sm text-muted-foreground">This will clear all short-term and conversation memory, freeing up approximately 17,500 tokens. Long-term memory will be preserved.</p>
              <div className="space-y-2"><Label>Retention period</Label>
                <Select defaultValue="1h">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Older than 1 hour</SelectItem>
                    <SelectItem value="6h">Older than 6 hours</SelectItem>
                    <SelectItem value="24h">Older than 24 hours</SelectItem>
                    <SelectItem value="7d">Older than 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Cleanup</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}