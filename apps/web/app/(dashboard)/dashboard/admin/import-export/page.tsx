"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Upload, FileText, CheckCircle2,
  AlertCircle, Clock, Database, FileSpreadsheet,
  FileJson, FileType, RefreshCw, Trash2,
  BarChart3, ArrowDownToLine, ArrowUpFromLine,
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

const jobs = [
  { id: "JOB-001", type: "export", entity: "Organizations", status: "completed", records: 847, date: "2h ago" },
  { id: "JOB-002", type: "export", entity: "Users", status: "completed", records: 3247, date: "1d ago" },
  { id: "JOB-003", type: "import", entity: "Prompts", status: "processing", records: 45, date: "30m ago" },
  { id: "JOB-004", type: "export", entity: "Deployments", status: "completed", records: 12, date: "3d ago" },
  { id: "JOB-005", type: "import", entity: "Knowledge Base", status: "failed", records: 0, date: "1h ago" },
];

export default function ImportExportPage() {
  const [entityType, setEntityType] = useState("organizations");
  const [exportFormat, setExportFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const [importFile, setImportFile] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Import / Export"
          description="Bulk import and export platform data."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Import/Export" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle>Export Data</CardTitle><CardDescription>Export entities to file</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizations">Organizations</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="prompts">Prompts</SelectItem>
                    <SelectItem value="deployments">Deployments</SelectItem>
                    <SelectItem value="knowledge">Knowledge Bases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Format</Label>
                <div className="flex gap-2">
                  {[
                    { value: "json", label: "JSON", icon: FileJson },
                    { value: "csv", label: "CSV", icon: FileSpreadsheet },
                    { value: "xml", label: "XML", icon: FileType },
                  ].map((f) => (
                    <button key={f.value} onClick={() => setExportFormat(f.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        exportFormat === f.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      }`}>
                      <f.icon className="h-4 w-4" />{f.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="glass" className="gap-2 w-full" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "Exporting..." : "Export Now"}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Import Data</CardTitle><CardDescription>Import entities from file</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Entity Type</Label>
                <Select defaultValue={entityType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizations">Organizations</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="prompts">Prompts</SelectItem>
                    <SelectItem value="knowledge">Knowledge Bases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Drop file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">JSON, CSV, XML (max 50MB)</p>
              </div>
              <Button variant="default" className="gap-2 w-full"><Upload className="h-4 w-4" />Upload & Import</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader><CardTitle>Job Status</CardTitle><CardDescription>Recent import/export jobs</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Job ID</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Entity</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Records</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-xs font-mono">{job.id}</td>
                      <td className="py-3">
                        <Badge variant={job.type === "export" ? "secondary" : "default"} className="gap-1">
                          {job.type === "export" ? <Download className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                          {job.type}
                        </Badge>
                      </td>
                      <td className="py-3">{job.entity}</td>
                      <td className="py-3 text-muted-foreground">{job.records.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={job.status === "completed" ? "success" : job.status === "processing" ? "warning" : "destructive"}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{job.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}