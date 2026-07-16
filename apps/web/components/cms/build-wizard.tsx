"use client";

import { useState } from "react";
import {
  Building2, Target, AppWindow, Cpu, CheckCircle2, ArrowLeft, ArrowRight,
  Check, Sparkles, Calculator, Rocket, Globe, Users, Clock, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuildWizard } from "@/store/use-build-wizard";
import { INDUSTRIES, STORE_CATEGORIES } from "@/types/cms";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Business Info", icon: Building2, description: "Tell us about your business" },
  { id: 2, label: "Goals", icon: Target, description: "Define your objectives" },
  { id: 3, label: "Apps", icon: AppWindow, description: "Connect your tools" },
  { id: 4, label: "AI Selection", icon: Cpu, description: "Choose AI solutions" },
  { id: 5, label: "Review", icon: CheckCircle2, description: "Review and deploy" },
];

const appList = [
  { key: "google" as const, label: "Google Workspace", icon: "G" },
  { key: "microsoft" as const, label: "Microsoft 365", icon: "M" },
  { key: "hubspot" as const, label: "HubSpot", icon: "H" },
  { key: "salesforce" as const, label: "Salesforce", icon: "S" },
  { key: "whatsapp" as const, label: "WhatsApp", icon: "W" },
  { key: "slack" as const, label: "Slack", icon: "Sl" },
  { key: "discord" as const, label: "Discord", icon: "D" },
  { key: "zapier" as const, label: "Zapier", icon: "Z" },
  { key: "n8n" as const, label: "n8n", icon: "n" },
  { key: "crm" as const, label: "CRM", icon: "C" },
  { key: "erp" as const, label: "ERP", icon: "E" },
];

export function BuildWizard() {
  const { wizard, setStep, updateBusiness, updateGoals, toggleApp, toggleChoice, setVoice, setVision, setKnowledgeBase, reset } = useBuildWizard();
  const [deploying, setDeploying] = useState(false);

  const canProceed = () => {
    if (wizard.step === 1) return wizard.business.name && wizard.business.industry;
    if (wizard.step === 2) return wizard.goals.description.length > 10;
    if (wizard.step === 3) return true;
    if (wizard.step === 4) return wizard.choices.aiEmployees.length > 0 || wizard.choices.aiAgents.length > 0 || wizard.choices.workflows.length > 0 || wizard.choices.voice || wizard.choices.vision || wizard.choices.knowledgeBase;
    return true;
  };

  const handleDeploy = () => {
    setDeploying(true);
    toast.success("Your custom AI workforce is being deployed!");
    setTimeout(() => {
      setDeploying(false);
      reset();
      toast.success("Deployment complete! Check your dashboard.");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Custom Build Wizard</h1>
        <p className="text-muted-foreground mt-2">Design your perfect AI workforce in 5 simple steps.</p>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => s.id < wizard.step && setStep(s.id)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                s.id < wizard.step ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer" :
                s.id === wizard.step ? "bg-primary/10 border-primary text-primary" :
                "bg-muted border-muted-foreground/20 text-muted-foreground cursor-default"
              )}
            >
              {s.id < wizard.step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:block text-center">
              <p className={cn("text-xs font-medium", s.id <= wizard.step ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          {wizard.step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Business Information</h3>
                <p className="text-sm text-muted-foreground mb-4">Tell us about your business so we can recommend the right AI solutions.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name</Label>
                  <Input
                    value={wizard.business.name}
                    onChange={(e) => updateBusiness({ name: e.target.value })}
                    placeholder="Acme Corp"
                    className="glass"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Industry</Label>
                  <select
                    value={wizard.business.industry}
                    onChange={(e) => updateBusiness({ industry: e.target.value })}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.id} value={ind.name}>{ind.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of Employees</Label>
                  <Input
                    value={wizard.business.employees}
                    onChange={(e) => updateBusiness({ employees: e.target.value })}
                    placeholder="1-10, 11-50, 51-200, 200+"
                    className="glass"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Country</Label>
                  <Input
                    value={wizard.business.country}
                    onChange={(e) => updateBusiness({ country: e.target.value })}
                    placeholder="United States"
                    className="glass"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Language</Label>
                  <select
                    value={wizard.business.language}
                    onChange={(e) => updateBusiness({ language: e.target.value })}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["English", "Spanish", "French", "German", "Portuguese", "Japanese", "Chinese", "Arabic"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Timezone</Label>
                  <select
                    value={wizard.business.timezone}
                    onChange={(e) => updateBusiness({ timezone: e.target.value })}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["UTC", "EST", "CST", "MST", "PST", "GMT", "CET", "IST", "JST"].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {wizard.step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Business Goals & Problems</h3>
                <p className="text-sm text-muted-foreground mb-4">Help us understand what you want to achieve.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Describe your business goals</Label>
                <Textarea
                  value={wizard.goals.description}
                  onChange={(e) => updateGoals({ description: e.target.value })}
                  placeholder="E.g., We want to automate our customer support, generate more leads, and streamline our HR processes..."
                  rows={4}
                  className="glass"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Current software you use (one per line)</Label>
                <Textarea
                  value={wizard.goals.currentSoftware.join("\n")}
                  onChange={(e) => updateGoals({ currentSoftware: e.target.value.split("\n").filter(Boolean) })}
                  placeholder="Salesforce&#10;HubSpot&#10;Slack&#10;Google Workspace"
                  rows={3}
                  className="glass"
                />
              </div>
            </div>
          )}

          {wizard.step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Connect Your Apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select the tools and platforms you use.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {appList.map((app) => (
                  <button
                    key={app.key}
                    onClick={() => toggleApp(app.key)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                      wizard.apps[app.key] ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                      wizard.apps[app.key] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {app.icon}
                    </div>
                    <span className="text-xs">{app.label}</span>
                    {wizard.apps[app.key] && <Check className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Custom APIs (one per line)</Label>
                <Textarea
                  value={wizard.apps.customApis.join("\n")}
                  onChange={(e) => updateGoals({ currentSoftware: e.target.value.split("\n").filter(Boolean) })}
                  placeholder="Custom CRM API&#10;Proprietary system&#10;Internal tool"
                  rows={2}
                  className="glass"
                />
              </div>
            </div>
          )}

          {wizard.step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Choose AI Solutions</h3>
                <p className="text-sm text-muted-foreground mb-4">Select the AI capabilities you need.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STORE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      if (["voice-ai", "chat-ai", "email-ai", "marketing-ai", "sales-ai", "hr-ai", "finance-ai", "customer-support-ai"].includes(cat.value)) {
                        toggleChoice("aiEmployees", cat.value);
                      } else if (["ai-employees", "ai-agents", "ai-workflows", "automation-templates"].includes(cat.value)) {
                        toggleChoice("aiAgents", cat.value);
                      } else {
                        toggleChoice("workflows", cat.value);
                      }
                    }}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all text-sm",
                      wizard.choices.aiEmployees.includes(cat.value) || wizard.choices.aiAgents.includes(cat.value) || wizard.choices.workflows.includes(cat.value)
                        ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="font-medium">{cat.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wizard.choices.voice} onChange={(e) => setVoice(e.target.checked)} className="rounded" />
                  <span className="text-sm">Voice AI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wizard.choices.vision} onChange={(e) => setVision(e.target.checked)} className="rounded" />
                  <span className="text-sm">Vision AI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wizard.choices.knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.checked)} className="rounded" />
                  <span className="text-sm">Knowledge Base</span>
                </label>
              </div>
            </div>
          )}

          {wizard.step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Review Your Build</h3>
                <p className="text-sm text-muted-foreground mb-4">Review your configuration before deployment.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{wizard.business.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{wizard.business.industry}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">Business Goals</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{wizard.goals.description.slice(0, 50)}...</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <AppWindow className="h-4 w-4 text-primary" />
                    <span className="text-sm">Connected Apps</span>
                  </div>
                  <Badge className="text-xs">{Object.entries(wizard.apps).filter(([, v]) => v === true).length} apps</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-sm">AI Solutions</span>
                  </div>
                  <Badge className="text-xs">{wizard.choices.aiEmployees.length + wizard.choices.aiAgents.length + wizard.choices.workflows.length + (wizard.choices.voice ? 1 : 0) + (wizard.choices.vision ? 1 : 0) + (wizard.choices.knowledgeBase ? 1 : 0)} selected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="text-sm">Estimated Monthly Cost</span>
                  </div>
                  <span className="text-lg font-bold text-primary">$1,247<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => wizard.step > 1 && setStep(wizard.step - 1)}
          disabled={wizard.step === 1}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        {wizard.step < 5 ? (
          <Button onClick={() => setStep(wizard.step + 1)} disabled={!canProceed()} className="gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleDeploy} disabled={deploying} className="gap-1">
            {deploying ? (
              <>Deploying... <Clock className="h-4 w-4 animate-spin" /></>
            ) : (
              <>Deploy AI Workforce <Rocket className="h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
