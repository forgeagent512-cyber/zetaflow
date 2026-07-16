"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Search, Filter, Calendar, Download,
  Eye, ChevronRight, AlertTriangle, CheckCircle2,
  XCircle, Info, Clock, User, Globe, Shield,
  ArrowUpDown, MoreHorizontal,
} from "lucide-react";
import { PageTransition } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

const logs = [
  { id: 1, user: "alice@buildagent.com", action: "login", resource: "Auth System", severity: "info", ip: "192.168.1.1", time: "2m ago", details: "Successful login from trusted device" },
  { id: 2, user: "bob@buildagent.com", action: "update", resource: "Prompt v3", severity: "info", ip: "192.168.1.2", time: "15m ago", details: "Updated prompt template variables" },
  { id: 3, user: "admin@buildagent.com", action: "delete", resource: "User #8472", severity: "warning", ip: "10.0.0.1", time: "1h ago", details: "Deleted inactive user account" },
  { id: 4, user: "system", action: "failed_login", resource: "Admin Panel", severity: "critical", ip: "203.0.113.0", time: "2h ago", details: "Multiple failed login attempts detected" },
  { id: 5, user: "carol@buildagent.com", action: "create", resource: "Deployment #12", severity: "info", ip: "192.168.1.5", time: "3h ago", details: "New deployment created successfully" },
  { id: 6, user: "dave@buildagent.com", action: "export", resource: "Organization Data", severity: "warning", ip: "192.168.1.8", time: "5h ago", details: "Exported 2,500 records" },
  { id: 7, user: "system", action: "backup", resource: "Database", severity: "info", ip: "—", time: "6h ago", details: "Scheduled backup completed" },
  { id: 8, user: "eve@buildagent.com", action: "permission_change", resource: "Role: Admin", severity: "critical", ip: "192.168.1.10", time: "1d ago", details: "Modified admin role permissions" },
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);

  const filtered = logs.filter(l => {
    if (severityFilter !== "All" && l.severity !== severityFilter) return false;
    if (searchTerm && !l.user.toLowerCase().includes(searchTerm.toLowerCase()) && !l.action.toLowerCase().includes(searchTerm.toLowerCase()) && !l.resource.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Audit Logs"
          description="View and search platform audit logs."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Audit Logs" }]}
          actions={<Button variant="glass" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" />Export</Button>}
        />

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Logs</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search user/action/resource..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 w-52 rounded-lg border border-input bg-transparent pl-8 pr-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon-sm"><Calendar className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Resource</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Severity</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">IP</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase">Time</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}>
                      <td className="py-3 text-xs">{log.user}</td>
                      <td className="py-3"><Badge variant="outline" className="text-[10px]">{log.action.replace(/_/g, " ")}</Badge></td>
                      <td className="py-3 text-xs text-muted-foreground">{log.resource}</td>
                      <td className="py-3">
                        <Badge variant={log.severity === "critical" ? "destructive" : log.severity === "warning" ? "warning" : "secondary"} className="text-[10px]">{log.severity}</Badge>
                      </td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                      <td className="py-3 text-xs text-muted-foreground">{log.time}</td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedLog(log)}><Eye className="h-3.5 w-3.5" /></Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Modal open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
          <ModalContent>
            <ModalHeader><ModalTitle>Log Details</ModalTitle><ModalDescription>Full audit event information</ModalDescription></ModalHeader>
            {selectedLog && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">User</Label><p className="text-sm mt-0.5">{selectedLog.user}</p></div>
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">Severity</Label>
                    <Badge variant={selectedLog.severity === "critical" ? "destructive" : selectedLog.severity === "warning" ? "warning" : "secondary"} className="mt-0.5">{selectedLog.severity}</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">Action</Label><p className="text-sm mt-0.5 capitalize">{selectedLog.action.replace(/_/g, " ")}</p></div>
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">Resource</Label><p className="text-sm mt-0.5">{selectedLog.resource}</p></div>
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">IP Address</Label><code className="text-sm mt-0.5 block font-mono">{selectedLog.ip}</code></div>
                  <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">Timestamp</Label><p className="text-sm mt-0.5">{selectedLog.time}</p></div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30"><Label className="text-[10px] text-muted-foreground">Description</Label><p className="text-sm mt-0.5">{selectedLog.details}</p></div>
              </div>
            )}
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Close</Button></ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}