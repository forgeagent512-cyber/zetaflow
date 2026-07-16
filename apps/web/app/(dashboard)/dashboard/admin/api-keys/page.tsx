"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key, Copy, Check, Eye, EyeOff, RotateCcw,
  Trash2, Plus, Search, BarChart3,
  CheckCircle2, AlertTriangle, XCircle,
  Clock, RefreshCw, Download, Globe,
  Activity, Users,
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
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const apiKeys = [
  { id: 1, name: "Production Key", key: "ba_prod_...k7m2", created: "2025-01-15", lastUsed: "2m ago", usage: 84721, status: "active", org: "Org A" },
  { id: 2, name: "Staging Key", key: "ba_test_...x3j9", created: "2025-03-20", lastUsed: "1h ago", usage: 12350, status: "active", org: "Org A" },
  { id: 3, name: "Development Key", key: "ba_dev_...p5n8", created: "2025-06-01", lastUsed: "5h ago", usage: 4567, status: "active", org: "Org B" },
  { id: 4, name: "CI/CD Key", key: "ba_ci_...r2k1", created: "2025-04-10", lastUsed: "1d ago", usage: 89234, status: "active", org: "Org C" },
  { id: 5, name: "Old Production Key", key: "ba_old_...v8m3", created: "2024-11-01", lastUsed: "30d ago", usage: 245000, status: "revoked", org: "Org A" },
  { id: 6, name: "Partner Integration", key: "ba_par_...h6t4", created: "2025-05-15", lastUsed: "3d ago", usage: 12500, status: "active", org: "Org D" },
];

export default function ApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState("");

  const filteredKeys = apiKeys.filter(k => !searchTerm || k.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCopy = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const key = "ba_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setGeneratedKey(key);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="API Keys"
          description="Manage, generate, and monitor API keys."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "API Keys" }]}
          actions={<Button variant="glass" className="gap-2" onClick={() => { setGeneratedKey(""); setShowGenerate(true); }}><Key className="h-4 w-4" />Generate Key</Button>}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Keys</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Key className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{apiKeys.length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{apiKeys.filter(k => k.status === "active").length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Activity className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{apiKeys.reduce((s, k) => s + k.usage, 0).toLocaleString()}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revoked</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><XCircle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{apiKeys.filter(k => k.status === "revoked").length}</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Key</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Org</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Usage</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Last Used</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((ak) => (
                    <motion.tr key={ak.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 font-medium">{ak.name}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <code className="text-xs font-mono text-muted-foreground">
                            {showKey[ak.id] ? ak.key : ak.key.slice(0, 8) + "..." + ak.key.slice(-4)}
                          </code>
                          <Button variant="ghost" size="icon-sm" onClick={() => setShowKey({ ...showKey, [ak.id]: !showKey[ak.id] })}>
                            {showKey[ak.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{ak.org}</td>
                      <td className="py-3">
                        <Badge variant={ak.status === "active" ? "success" : "destructive"}>{ak.status}</Badge>
                      </td>
                      <td className="py-3 font-mono text-xs">{ak.usage.toLocaleString()}</td>
                      <td className="py-3 text-xs text-muted-foreground">{ak.lastUsed}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(ak.id, ak.key)}>
                            {copiedId === ak.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon-sm"><RotateCcw className="h-3.5 w-3.5" /></Button>
                          {ak.status === "active" && <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Modal open={showGenerate} onOpenChange={setShowGenerate}>
          <ModalContent>
            <ModalHeader><ModalTitle>Generate API Key</ModalTitle><ModalDescription>Create a new API key for your application</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Key Name</Label><Input placeholder="e.g., Production Key" /></div>
              <div className="space-y-2"><Label>Organization</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select org" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org-a">Org A</SelectItem><SelectItem value="org-b">Org B</SelectItem>
                    <SelectItem value="org-c">Org C</SelectItem><SelectItem value="org-d">Org D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="glass" className="gap-2 w-full" onClick={handleGenerate}><Key className="h-4 w-4" />Generate Key</Button>
              {generatedKey && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-1"><Label className="text-xs text-muted-foreground">Generated Key:</Label></div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono flex-1 break-all">{generatedKey}</code>
                    <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(generatedKey)}><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                  <p className="text-xs text-amber-500 mt-2">Copy this key now. It will not be shown again.</p>
                </motion.div>
              )}
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Close</Button></ModalClose>
              {generatedKey && <Button variant="default" className="gap-2"><Key className="h-4 w-4" />Done</Button>}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}