"use client";

import { useState } from "react";
import {
  Plus,
  Bell,
  Megaphone,
  Edit3,
  Trash2,
  Eye,
  CalendarClock,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAnnouncementStore } from "@/store/use-announcements-store";
import type { Announcement } from "@/types/cms";

export function AnnouncementsCenter() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, getActiveAnnouncements } = useAnnouncementStore();
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const createAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: "New Announcement",
      message: "",
      type: "announcement",
      status: "draft",
      priority: "medium",
      placement: "top",
      dismissible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAnnouncement(newAnnouncement);
    setEditing(newAnnouncement);
    setShowEditor(true);
    toast.success("Announcement created");
  };

  const activeCount = getActiveAnnouncements().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Announcement Center</h2>
          <p className="text-sm text-muted-foreground">{activeCount} active announcement(s)</p>
        </div>
        <Button size="sm" onClick={createAnnouncement}>
          <Plus className="mr-2 h-4 w-4" /> New Announcement
        </Button>
      </div>

      {showEditor && editing ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle>{editing.id === `ann-${Date.now()}` ? "New" : "Edit"} Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm" value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value as Announcement["type"] })}>
                  <option value="announcement">Announcement</option>
                  <option value="banner">Banner</option>
                  <option value="popup">Popup</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="feature-release">Feature Release</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm" value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Announcement["status"] })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm" value={editing.priority}
                  onChange={(e) => setEditing({ ...editing, priority: e.target.value as Announcement["priority"] })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (optional)</Label>
                <Input type="datetime-local" value={editing.startAt || ""} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input type="datetime-local" value={editing.endAt || ""} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editing.dismissible} onCheckedChange={(v) => setEditing({ ...editing, dismissible: v })} />
                <Label className="text-sm">Dismissible</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setShowEditor(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => { updateAnnouncement(editing.id, editing); setShowEditor(false); setEditing(null); toast.success("Saved"); }}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">No announcements</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first announcement</p>
                <Button onClick={createAnnouncement}><Plus className="mr-2 h-4 w-4" /> Create</Button>
              </CardContent>
            </Card>
          ) : (
            announcements.map((ann) => (
              <Card key={ann.id} className="glass">
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      ann.priority === "critical" ? "bg-destructive/10" :
                      ann.priority === "high" ? "bg-amber-500/10" : "bg-primary/10"
                    }`}>
                      <Bell className={`h-5 w-5 ${
                        ann.priority === "critical" ? "text-destructive" :
                        ann.priority === "high" ? "text-amber-500" : "text-primary"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{ann.title}</p>
                        <Badge variant={ann.status === "active" ? "success" : ann.status === "scheduled" ? "warning" : "secondary"}>
                          {ann.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ann.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ann.type} · {ann.priority} priority</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(ann); setShowEditor(true); }}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { deleteAnnouncement(ann.id); toast.success("Deleted"); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
