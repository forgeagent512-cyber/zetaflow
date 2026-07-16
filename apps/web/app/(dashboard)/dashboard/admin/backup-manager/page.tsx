"use client";

import { useState } from "react";
import {
  Database,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Backup {
  id: number;
  name: string;
  type: "full" | "incremental";
  size: string;
  date: string;
  status: "completed" | "failed" | "in_progress";
}

export default function BackupManagerPage() {
  const [backups, setBackups] = useState<Backup[]>([
    { id: 1, name: "weekly-full-backup", type: "full", size: "2.4 GB", date: "2026-07-09 03:00", status: "completed" },
    { id: 2, name: "daily-incremental-01", type: "incremental", size: "347 MB", date: "2026-07-08 03:00", status: "completed" },
    { id: 3, name: "daily-incremental-02", type: "incremental", size: "412 MB", date: "2026-07-07 03:00", status: "completed" },
    { id: 4, name: "weekly-full-backup", type: "full", size: "2.3 GB", date: "2026-07-02 03:00", status: "completed" },
    { id: 5, name: "nightly-backup", type: "incremental", size: "0 B", date: "2026-07-09 04:00", status: "failed" },
    { id: 6, name: "monthly-archive", type: "full", size: "8.1 GB", date: "2026-07-01 02:00", status: "completed" },
  ]);
  const [creating, setCreating] = useState(false);
  const [backupType, setBackupType] = useState("incremental");

  const createBackup = () => {
    setCreating(true);
    setTimeout(() => {
      setBackups([{
        id: Date.now(),
        name: backupType === "full" ? "manual-full-backup" : "manual-incremental",
        type: backupType as "full" | "incremental",
        size: backupType === "full" ? "2.4 GB" : "156 MB",
        date: new Date().toLocaleString(),
        status: "completed",
      }, ...backups]);
      setCreating(false);
    }, 3000);
  };

  const deleteBackup = (id: number) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  const restoreBackup = (id: number) => {
    setBackups(backups.map((b) => b.id === id ? { ...b, status: "in_progress" as const } : b));
    setTimeout(() => {
      setBackups(backups.map((b) => b.id === id ? { ...b, status: "completed" as const } : b));
    }, 3000);
  };

  const totalSize = backups.reduce((acc, b) => {
    const match = b.size.match(/([\d.]+)\s*(GB|MB|KB)/);
    if (!match) return acc;
    const val = parseFloat(match[1]);
    const unit = match[2];
    return acc + (unit === "GB" ? val * 1024 : unit === "MB" ? val : val / 1024);
  }, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Backup Manager"
          description="Manage database and system backups."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Backup Manager" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Backups", value: backups.length.toString(), icon: Database },
            { label: "Total Size", value: `${(totalSize / 1024).toFixed(1)} GB`, icon: HardDrive },
            { label: "Last Backup", value: backups[0]?.date || "-", icon: Clock },
            { label: "Failed", value: backups.filter((b) => b.status === "failed").length.toString(), icon: AlertTriangle },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerWrapper>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backups</CardTitle>
                <CardDescription>List of all system backups.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={backupType} onValueChange={setBackupType}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Backup</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createBackup} disabled={creating} className="gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {creating ? "Creating..." : "Create Backup"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{backup.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={backup.type === "full" ? "default" : "secondary"}>{backup.type}</Badge>
                      </td>
                      <td className="py-3 px-4">{backup.size}</td>
                      <td className="py-3 px-4 text-muted-foreground">{backup.date}</td>
                      <td className="py-3 px-4">
                        {backup.status === "completed" ? (
                          <Badge variant="success">Completed</Badge>
                        ) : backup.status === "failed" ? (
                          <Badge variant="destructive">Failed</Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Restoring</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => restoreBackup(backup.id)} title="Restore">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => deleteBackup(backup.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
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
