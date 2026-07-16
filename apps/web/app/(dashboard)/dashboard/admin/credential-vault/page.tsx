"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Plus, Eye, EyeOff, Copy, RotateCcw,
  Trash2, Key, Shield, CheckCircle2, AlertCircle,
  Search, Server, User, Globe, Database,
  RefreshCw, Download,
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

const credentials = [
  { id: 1, name: "OpenAI API Key", type: "api_key", masked: "sk-...f3k2", updated: "1h ago", status: "active" },
  { id: 2, name: "Anthropic API Key", type: "api_key", masked: "sk-ant-...x7j9", updated: "3h ago", status: "active" },
  { id: 3, name: "Database Password", type: "password", masked: "••••••••", updated: "1d ago", status: "active" },
  { id: 4, name: "SMTP Credentials", type: "smtp", masked: "smtp...@mail.com", updated: "2d ago", status: "active" },
  { id: 5, name: "Stripe Secret Key", type: "api_key", masked: "sk_live_...m4p2", updated: "1w ago", status: "rotated" },
  { id: 6, name: "AWS Access Key", type: "access_key", masked: "AKIA...Q3R2", updated: "2w ago", status: "active" },
];

export default function CredentialVaultPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [visibleCreds, setVisibleCreds] = useState<Record<number, boolean>>({});

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Credential Vault"
          description="Securely manage API keys, passwords, and credentials."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Credential Vault" }]}
          actions={<Button variant="glass" className="gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Add Credential</Button>}
        />

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Credentials</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Value</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Updated</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => (
                    <motion.tr key={cred.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 font-medium">{cred.name}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[10px]">{cred.type.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-muted-foreground">{visibleCreds[cred.id] ? cred.masked : cred.masked.replace(/[^.]/g, "•")}</code>
                          <Button variant="ghost" size="icon-sm" onClick={() => setVisibleCreds({ ...visibleCreds, [cred.id]: !visibleCreds[cred.id] })}>
                            {visibleCreds[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={cred.status === "active" ? "success" : "warning"}>{cred.status}</Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{cred.updated}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm"><Copy className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm"><RotateCcw className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setShowConfirmDelete(cred.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Modal open={showAdd} onOpenChange={setShowAdd}>
          <ModalContent>
            <ModalHeader><ModalTitle>Add Credential</ModalTitle><ModalDescription>Store a new credential securely</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Credential Name</Label><Input placeholder="e.g., OpenAI API Key" /></div>
              <div className="space-y-2"><Label>Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="access_key">Access Key</SelectItem>
                    <SelectItem value="token">Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Value</Label>
                <Textarea placeholder="Paste credential value" rows={3} className="font-mono text-xs" />
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="default" className="gap-2"><Shield className="h-4 w-4" />Encrypt & Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal open={showConfirmDelete !== null} onOpenChange={() => setShowConfirmDelete(null)}>
          <ModalContent>
            <ModalHeader><ModalTitle>Delete Credential</ModalTitle><ModalDescription>This action cannot be undone</ModalDescription></ModalHeader>
            <div className="py-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Are you sure you want to delete this credential? Any services using it will stop working.</p>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}

