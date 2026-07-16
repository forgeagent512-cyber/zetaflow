"use client";

import { useState } from "react";
import {
  Plus,
  Mail,
  Edit3,
  Trash2,
  Save,
  Copy,
  Eye,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEmailTemplatesStore } from "@/store/use-email-templates-store";
import type { EmailTemplate, EmailTemplateType } from "@/types/cms";

const templateTypes: { value: EmailTemplateType; label: string }[] = [
  { value: "welcome", label: "Welcome" },
  { value: "verification", label: "Verification" },
  { value: "password-reset", label: "Password Reset" },
  { value: "invoice", label: "Invoice" },
  { value: "deployment-success", label: "Deployment Success" },
  { value: "deployment-failed", label: "Deployment Failed" },
  { value: "marketing", label: "Marketing" },
  { value: "newsletter", label: "Newsletter" },
];

export function EmailTemplates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, selectedTemplateId, setSelectedTemplate } = useEmailTemplatesStore();
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [activeTab, setActiveTab] = useState("list");

  const createTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `email-${Date.now()}`,
      name: "New Email Template",
      type: "custom",
      subject: "",
      previewText: "",
      content: "",
      variables: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTemplate(newTemplate);
    setSelectedTemplate(newTemplate.id);
    setActiveTab("editor");
    toast.success("Template created");
  };

  if (!selectedTemplate || activeTab === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
            <p className="text-sm text-muted-foreground">Manage email templates</p>
          </div>
          <Button size="sm" onClick={createTemplate}>
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templateTypes.map(({ value, label }) => {
            const existing = templates.find((t) => t.type === value);
            return (
              <Card key={value} className={`glass cursor-pointer transition-colors ${existing ? "hover:bg-accent/50" : "opacity-60"}`}
                onClick={() => { if (existing) { setSelectedTemplate(existing.id); setActiveTab("editor"); } }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{existing ? existing.name : "Not configured"}</p>
                    </div>
                  </div>
                  {existing && (
                    <div className="flex items-center gap-2">
                      <Badge variant={existing.status === "active" ? "success" : "secondary"}>{existing.status}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{selectedTemplate.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedTemplate.type} template</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("list")}>All Templates</Button>
          <Button size="sm"><Save className="mr-2 h-4 w-4" /> Save</Button>
        </div>
      </div>

      <Card className="glass">
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input value={selectedTemplate.name} onChange={(e) => updateTemplate(selectedTemplate.id, { name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input value={selectedTemplate.subject} onChange={(e) => updateTemplate(selectedTemplate.id, { subject: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preview Text</Label>
            <Input value={selectedTemplate.previewText} onChange={(e) => updateTemplate(selectedTemplate.id, { previewText: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>HTML Content</Label>
            <Textarea
              value={selectedTemplate.content}
              onChange={(e) => updateTemplate(selectedTemplate.id, { content: e.target.value })}
              rows={20}
              className="font-mono text-sm"
              placeholder="<html><body>Your email content here...</body></html>"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
