"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Send, Plus, CheckCircle2,   AlertTriangle, AlertCircle, XCircle,
  Info, X, Eye, EyeOff, Clock, Settings,
  Mail, MessageSquare, Globe, Smartphone,
  Volume2, VolumeX, Trash2, Search, Filter,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose,
} from "@/components/ui/modal";

const notifications = [
  { id: 1, title: "Deployment v3.2.1 completed", type: "success", message: "Web App deployment succeeded after 2m 34s", time: "5m ago", read: false },
  { id: 2, title: "High memory usage detected", type: "warning", message: "AI Worker-4 is using 92% of available memory", time: "1h ago", read: false },
  { id: 3, title: "New organization registered", type: "info", message: "Citywide Properties has joined the platform", time: "3h ago", read: false },
  { id: 4, title: "Gemini API degradation", type: "error", message: "Gemini 1.5 Pro latency exceeded 1s threshold", time: "5h ago", read: true },
  { id: 5, title: "Backup completed", type: "success", message: "Daily full backup completed successfully (4.2GB)", time: "8h ago", read: true },
  { id: 6, title: "SSL certificate expiring", type: "warning", message: "SSL certificate for buildagent.com expires in 14 days", time: "1d ago", read: true },
];

export default function NotificationsPage() {
  const [showSend, setShowSend] = useState(false);
  const [navigator, setNavigator] = useState("all");
  const [notifs, setNotifs] = useState(notifications);

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

  const filtered = notifs.filter(n => navigator === "all" || (navigator === "unread" && !n.read));

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Notification Center"
          description="Manage and send platform notifications."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Notifications" }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={markAllRead}><CheckCircle2 className="h-3.5 w-3.5" />Mark All Read</Button>
              <Button variant="glass" size="sm" className="gap-1" onClick={() => setShowSend(true)}><Send className="h-3.5 w-3.5" />Send Notification</Button>
            </div>
          }
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Bell className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{notifs.length}</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">{notifs.filter(n => !n.read).length}</span></div><p className="text-2xl font-bold">{notifs.filter(n => !n.read).length}</p></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Channels</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Globe className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">3</p></div></div></CardContent></Card></StaggerItem>
          <StaggerItem><Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Mail className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">99.8%</p></div></div></CardContent></Card></StaggerItem>
        </StaggerWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Notifications</CardTitle>
                  <div className="flex gap-1 rounded-lg border border-input overflow-hidden">
                    {["all", "unread"].map((v) => (
                      <button key={v} onClick={() => setNavigator(v)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${navigator === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                        {v === "all" ? "All" : "Unread"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filtered.map((n) => (
                    <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${!n.read ? "bg-primary/5 border-primary/20" : "border-border hover:bg-muted/20"}`}>
                      {n.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> :
                       n.type === "warning" ? <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" /> :
                       n.type === "error" ? <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" /> :
                       <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{n.title}</span>
                          {!n.read && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5" /></Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Channel Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "In-App", icon: Bell, enabled: true },
                  { name: "Email", icon: Mail, enabled: true },
                  { name: "Slack", icon: MessageSquare, enabled: true },
                  { name: "SMS", icon: Smartphone, enabled: false },
                  { name: "Push", icon: Globe, enabled: true },
                ].map((ch) => (
                  <div key={ch.name} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <ch.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{ch.name}</span>
                    </div>
                    <Switch checked={ch.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal open={showSend} onOpenChange={setShowSend}>
          <ModalContent>
            <ModalHeader><ModalTitle>Send Notification</ModalTitle><ModalDescription>Send a notification to users</ModalDescription></ModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input placeholder="Notification title" /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Notification message" rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Priority</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Audience</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="orgs">Specific Organizations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
              <Button variant="default" className="gap-2"><Send className="h-4 w-4" />Send</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PageTransition>
  );
}

