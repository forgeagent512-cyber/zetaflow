"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key, Plus, Eye, EyeOff, Copy, RotateCcw,
  Trash2, CheckCircle2, XCircle, AlertTriangle,
  Search, Shield, FileText, Download, Lock,
  Check, AlertCircle, RefreshCw,
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

const licenses = [
  { id: "LIC-001", plan: "Enterprise", organization: "Org A", seats: 50, status: "active", expires: "2026-07-09", issued: "2025-07-09" },
  { id: "LIC-002", plan: "Business", organization: "Org B", seats: 20, status: "active", expires: "2026-06-15", issued: "2025-06-15" },
  { id: "LIC-003", plan: "Pro", organization: "Org C", seats: 10, status: "active", expires: "2026-08-01", issued: "2025-08-01" },
  { id: "LIC-004", plan: "Enterprise", organization: "Org D", seats: 100, status: "expired", expires: "2025-06-01", issued: "2024-06-01" },
  { id: "LIC-005", plan: "Starter", organization: "Org E", seats: 3, status: "active", expires: "2026-05-20", issued: "2025-05-20" },
];

const planFeatures = [
  { feature: "AI Employees", starter: "3", pro: "10", business: "50", enterprise: "Unlimited" },
  { feature: "Knowledge Bases", starter: "1", pro: "5", business: "20", enterprise: "Unlimited" },
  { feature: "API Calls/month", starter: "10K", pro: "100K", business: "500K", enterprise: "Unlimited" },
  { feature: "Custom Branding", starter: "—", pro: "—", business: "✓", enterprise: "✓" },
  { feature: "Priority Support", starter: "—", pro: "—", business: "✓", enterprise: "✓" },
  { feature: "SSO", starter: "—", pro: "—", business: "—", enterprise: "✓" },
  { feature: "Audit Logs", starter: "—", pro: "7 days", business: "30 days", enterprise: "90 days" },
];

export default function LicenseManagerPage() {
  const [showGenerate, setShowGenerate] = useState(false);
  const [showValidate, setShowValidate] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [showLicenseKey, setShowLicenseKey] = useState<Record<string, boolean>>({});

  const validateLicense = () => {
    if (!licenseKey) return;
    setTimeout(() => {
      const valid = licenseKey.length > 10;
      setValidationResult({
        valid,
        message: valid ? "License key is valid. Expires: 2026-07-09" : "Invalid license key format. Please check and try again."
      });
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="License Manager"
          description="Generate, validate, and manage license keys."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "License Manager" }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowValidate(true)}><Shield className="h-3.5 w-3.5" />Validate</Button>
              <Button variant="glass" size="sm" className="gap-1" onClick={() => setShowGenerate(true)}><Plus className="h-3.5 w-3.5" />Generate</Button>
            </div>
          }
        />

        <Card className="glass">
          <CardHeader><CardTitle>Licenses</CardTitle><CardDescription>All active and expired licenses</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">License ID</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Plan</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Org</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Seats</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Expires</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((lic) => (
                    <motion.tr key={lic.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 font-mono text-xs">{lic.id}</td>
                      <td className="py-3"><Badge variant={lic.plan === "Enterprise" ? "default" : lic.plan === "Business" ? "secondary" : "outline"}>{lic.plan}</Badge></td>
                      <td className="py-3">{lic.organization}</td>
                      <td className="py-3 text-muted-foreground">{lic.seats}</td>
                      <td className="py-3"><Badge variant={lic.status === "active" ? "success" : "destructive"}>{lic.status}</Badge></td>
                      <td className="py-3 text-xs text-muted-foreground">{lic.expires}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setShowLicenseKey({ ...showLicenseKey, [lic.id]: !showLicenseKey[lic.id] })}>
                            {showLicenseKey[lic.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon-sm"><Copy className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm"><RotateCcw className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Plan Features Matrix</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Feature</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Starter</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Pro</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Business</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((pf) => (
                    <tr key={pf.feature} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{pf.feature}</td>
                      <td className="py-3 text-muted-foreground">{pf.starter}</td>
                      <td className="py-3 text-muted-foreground">{pf.pro}</td>
                      <td className="py-3 text-muted-foreground">{pf.business}</td>
                      <td className="py-3 font-medium text-primary">{pf.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Modal open={showGenerate} onOpenChange={setShowGenerate}>
          <ModalContent>
            <ModalHeader><ModalTitle>Generate License</ModalTitle><ModalDescription>Create a new license key</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Organization</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select org" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org-a">Org A</SelectItem><SelectItem value="org-b">Org B</SelectItem><SelectItem value="org-c">Org C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Plan</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Seats</Label><Input type="number" min={1} defaultValue={10} /></div>
              <div className="space-y-2"><Label>Duration (months)</Label>
                <Select defaultValue="12">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 month</SelectItem><SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem><SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="default" className="gap-2"><Key className="h-4 w-4" />Generate</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal open={showValidate} onOpenChange={setShowValidate}>
          <ModalContent>
            <ModalHeader><ModalTitle>Validate License</ModalTitle><ModalDescription>Check if a license key is valid</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>License Key</Label>
                <Input placeholder="Enter license key..." value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="font-mono text-xs" />
              </div>
              <Button variant="glass" className="gap-2 w-full" onClick={validateLicense}><Shield className="h-4 w-4" />Validate</Button>
              {validationResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg border ${validationResult.valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm">{validationResult.message}</span>
                  </div>
                </motion.div>
              )}
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Close</Button></ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}