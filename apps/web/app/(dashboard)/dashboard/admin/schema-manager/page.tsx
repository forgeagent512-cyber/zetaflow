"use client";

import { useState } from "react";
import {
  Code,
  Plus,
  Copy,
  Trash2,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const schemaTypeOptions = [
  "Organization", "FAQPage", "Article", "Product", "LocalBusiness",
  "Person", "Event", "Recipe", "Review", "VideoObject", "HowTo",
  "BreadcrumbList", "SoftwareApplication", "Course", "JobPosting",
];

interface SchemaItem {
  id: number;
  name: string;
  type: string;
  json: string;
  status: "active" | "inactive";
  createdAt: string;
}

export default function SchemaManagerPage() {
  const [schemas, setSchemas] = useState<SchemaItem[]>([
    { id: 1, name: "Organization Schema", type: "Organization", json: '{"@context":"https://schema.org","@type":"Organization","name":"BuildAgent"}', status: "active", createdAt: "2026-06-01" },
    { id: 2, name: "FAQ Page", type: "FAQPage", json: '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}', status: "active", createdAt: "2026-06-15" },
    { id: 3, name: "Blog Article", type: "Article", json: '{"@context":"https://schema.org","@type":"Article"}', status: "inactive", createdAt: "2026-06-20" },
  ]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newJson, setNewJson] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const addSchema = () => {
    if (!newName || !newType) return;
    const defaultJson: Record<string, string> = {
      Organization: '{"@context":"https://schema.org","@type":"Organization","name":"Your Org"}',
      FAQPage: '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Q","acceptedAnswer":{"@type":"Answer","text":"A"}}]}',
      Article: '{"@context":"https://schema.org","@type":"Article","headline":"Title"}',
      Product: '{"@context":"https://schema.org","@type":"Product","name":"Product"}',
      LocalBusiness: '{"@context":"https://schema.org","@type":"LocalBusiness","name":"Business"}',
    };
    setSchemas([...schemas, {
      id: Date.now(),
      name: newName,
      type: newType,
      json: newJson || defaultJson[newType] || `{"@context":"https://schema.org","@type":"${newType}"}`,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }]);
    setNewName("");
    setNewType("");
    setNewJson("");
    setShowForm(false);
  };

  const deleteSchema = (id: number) => {
    setSchemas(schemas.filter((s) => s.id !== id));
  };

  const toggleStatus = (id: number) => {
    setSchemas(schemas.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Schema Manager"
          description="Create and manage schema markup for your site."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Schema Manager" }]}
        />

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Schemas", value: schemas.length.toString(), icon: FileJson },
            { label: "Active", value: schemas.filter((s) => s.status === "active").length.toString(), icon: CheckCircle2 },
            { label: "Types Used", value: [...new Set(schemas.map((s) => s.type))].length.toString(), icon: Code },
            { label: "Inactive", value: schemas.filter((s) => s.status === "inactive").length.toString(), icon: AlertCircle },
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
                <CardTitle>Schema Markups</CardTitle>
                <CardDescription>Manage your structured data markup entries.</CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "New Schema"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showForm && (
              <div className="p-4 rounded-lg bg-white/5 border border-border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Schema name" />
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemaTypeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea value={newJson} onChange={(e) => setNewJson(e.target.value)} placeholder="JSON-LD markup (optional - default template will be used)" rows={4} className="font-mono text-xs" />
                <Button onClick={addSchema} disabled={!newName || !newType}>
                  <Plus className="h-4 w-4 mr-2" /> Create Schema
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {schemas.map((schema) => (
                <div key={schema.id} className="p-4 rounded-lg bg-white/5 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{schema.name}</span>
                      <Badge variant="outline" className="text-xs">{schema.type}</Badge>
                      <Badge variant={schema.status === "active" ? "success" : "secondary"} className="text-xs">{schema.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setPreviewId(previewId === schema.id ? null : schema.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(schema.json)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleStatus(schema.id)}>
                        <CheckCircle2 className={`h-4 w-4 ${schema.status === "active" ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteSchema(schema.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {schema.createdAt}</span>
                  </div>
                  {previewId === schema.id && (
                    <pre className="mt-2 p-3 rounded bg-black/30 text-xs text-emerald-400 overflow-x-auto max-h-40 overflow-y-auto">{schema.json}</pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
