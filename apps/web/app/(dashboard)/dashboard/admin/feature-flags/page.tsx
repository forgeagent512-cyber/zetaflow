"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flag, Plus, ToggleLeft, CheckCircle2, XCircle,
  AlertTriangle, Settings, Users, Globe, Save,
  Trash2, Edit3, Search, Filter, FlaskConical,
  Building,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

interface Flag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  beta: boolean;
  orgOverride: boolean;
  environment: string;
}

const initialFlags: Flag[] = [
  { id: 1, name: "new-onboarding-flow", description: "New user onboarding experience", enabled: true, beta: false, orgOverride: false, environment: "production" },
  { id: 2, name: "advanced-analytics", description: "Advanced analytics dashboard", enabled: true, beta: true, orgOverride: true, environment: "production" },
  { id: 3, name: "ai-playground", description: "AI model playground feature", enabled: false, beta: true, orgOverride: false, environment: "staging" },
  { id: 4, name: "dark-mode", description: "Dark mode UI theme", enabled: true, beta: false, orgOverride: false, environment: "production" },
  { id: 5, name: "bulk-import", description: "Bulk data import feature", enabled: false, beta: false, orgOverride: true, environment: "development" },
  { id: 6, name: "real-time-sync", description: "Real-time data sync", enabled: true, beta: true, orgOverride: false, environment: "production" },
  { id: 7, name: "white-label", description: "White label branding", enabled: true, beta: false, orgOverride: false, environment: "production" },
  { id: 8, name: "deployment-auto-rollback", description: "Auto rollback on failure", enabled: false, beta: false, orgOverride: false, environment: "staging" },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>(initialFlags);
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: "", description: "", environment: "production" });
  const [searchTerm, setSearchTerm] = useState("");
  const [envFilter, setEnvFilter] = useState("all");

  const toggleFlag = (id: number) => {
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const filteredFlags = flags.filter(f => {
    if (envFilter !== "all" && f.environment !== envFilter) return false;
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Feature Flags"
          description="Manage feature toggles and beta flags across environments."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Feature Flags" }]}
          actions={<Button variant="glass" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Flag</Button>}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Flags</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Flag className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{flags.length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><ToggleLeft className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{flags.filter(f => f.enabled).length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Beta</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Badge variant="warning">Beta</Badge><div><p className="text-2xl font-bold">{flags.filter(f => f.beta).length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Org Overrides</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Building className="h-8 w-8 text-violet-500" /><div><p className="text-2xl font-bold">{flags.filter(f => f.orgOverride).length}</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feature Flags</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 w-44 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <Select value={envFilter} onValueChange={setEnvFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Environment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFlags.map((flag) => (
                <motion.div key={flag.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-medium">{flag.name}</code>
                      {flag.beta && <Badge variant="warning" className="text-[10px]">Beta</Badge>}
                      <Badge variant={flag.enabled ? "success" : "secondary"} className="text-[10px]">{flag.enabled ? "ON" : "OFF"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">Env: {flag.environment}</span>
                      {flag.orgOverride && (
                        <Badge variant="outline" className="text-[10px] gap-0.5"><Building className="h-2.5 w-2.5" />Org override</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Modal open={showCreate} onOpenChange={setShowCreate}>
          <ModalContent>
            <ModalHeader><ModalTitle>Create Feature Flag</ModalTitle><ModalDescription>Add a new feature flag</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Flag Name (snake_case)</Label><Input placeholder="my-awesome-feature" value={newFlag.name} onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })} className="font-mono text-xs" /></div>
              <div className="space-y-2"><Label>Description</Label><Input placeholder="Describe the feature" value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Environment</Label>
                <Select value={newFlag.environment} onValueChange={(v) => setNewFlag({ ...newFlag, environment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="default" className="gap-2"><Save className="h-4 w-4" />Create Flag</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}