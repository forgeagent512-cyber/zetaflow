"use client";

import { useState } from "react";
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Save,
  Copy,
  Eye,
  FormInput,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useFormsStore } from "@/store/use-forms-store";
import type { FormDefinition, FormField } from "@/types/cms";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "date", label: "Date" },
  { value: "file", label: "File" },
];

export function FormsBuilder() {
  const { forms, selectedFormId, addForm, updateForm, deleteForm, setSelectedForm } = useFormsStore();
  const selectedForm = forms.find((f) => f.id === selectedFormId);
  const [activeTab, setActiveTab] = useState("list");

  const createForm = () => {
    const newForm: FormDefinition = {
      id: `form-${Date.now()}`,
      name: "New Form",
      description: "",
      type: "contact",
      fields: [],
      settings: {
        submitLabel: "Submit",
        successMessage: "Thank you for your submission!",
        storeSubmissions: true,
        captchaEnabled: false,
        sendEmailNotification: false,
      },
      status: "draft",
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addForm(newForm);
    setSelectedForm(newForm.id);
    setActiveTab("editor");
    toast.success("Form created");
  };

  const addField = () => {
    if (!selectedFormId || !selectedForm) return;
    const field: FormField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
      options: [],
      order: selectedForm.fields.length,
      validation: {},
    };
    updateForm(selectedFormId, { fields: [...selectedForm.fields, field] });
  };

  const removeField = (fieldId: string) => {
    if (!selectedFormId || !selectedForm) return;
    updateForm(selectedFormId, { fields: selectedForm.fields.filter((f) => f.id !== fieldId) });
  };

  if (!selectedForm || activeTab === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Forms Builder</h2>
            <p className="text-sm text-muted-foreground">Create and manage forms</p>
          </div>
          <Button size="sm" onClick={createForm}>
            <Plus className="mr-2 h-4 w-4" /> New Form
          </Button>
        </div>

        {forms.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <FormInput className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">No forms yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first form</p>
              <Button onClick={createForm}><Plus className="mr-2 h-4 w-4" /> Create Form</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <Card key={form.id} className="glass cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => { setSelectedForm(form.id); setActiveTab("editor"); }}>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{form.name}</p>
                    <p className="text-sm text-muted-foreground">{form.type} · {form.fields.length} fields · {form.submissions} submissions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${form.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {form.status}
                    </span>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); deleteForm(form.id); toast.success("Deleted"); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{selectedForm.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedForm.type} form</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("list")}>
            All Forms
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedForm.fields.map((field) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border group">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{field.label}</p>
                  <p className="text-xs text-muted-foreground">{field.type}{field.required ? " · Required" : ""}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm"><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeField(field.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={selectedForm.name}
                onChange={(e) => updateForm(selectedForm.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Submit Label</Label>
              <Input
                value={selectedForm.settings.submitLabel}
                onChange={(e) => updateForm(selectedForm.id, { settings: { ...selectedForm.settings, submitLabel: e.target.value } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Store Submissions</Label>
              <Switch
                checked={selectedForm.settings.storeSubmissions}
                onCheckedChange={(v) => updateForm(selectedForm.id, { settings: { ...selectedForm.settings, storeSubmissions: v } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Captcha</Label>
              <Switch
                checked={selectedForm.settings.captchaEnabled}
                onCheckedChange={(v) => updateForm(selectedForm.id, { settings: { ...selectedForm.settings, captchaEnabled: v } })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
