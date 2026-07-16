"use client";

import { useState } from "react";
import {
  UserPlus,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Shield,
  Palette,
  Rocket,
  Package,
  Users,
  Settings,
} from "lucide-react";
import { PageTransition, StaggerWrapper, StaggerItem } from "@/components/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const plans = ["Starter", "Professional", "Enterprise", "Custom"];
const features = [
  "AI Chatbot", "Content Generation", "SEO Tools", "Analytics Dashboard",
  "API Access", "White Label", "Priority Support", "Custom Training",
];

export default function ProvisioningPage() {
  const [orgName, setOrgName] = useState("");
  const [plan, setPlan] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [provisioningLog, setProvisioningLog] = useState<string[]>([]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const startProvisioning = () => {
    if (!orgName || !plan) return;
    setProvisioning(true);
    setCompleted(false);
    setProgress(0);
    setProvisioningLog([]);

    const steps = [
      "Creating organization account...",
      "Setting up database...",
      "Configuring plan features...",
      "Provisioning API keys...",
      "Setting up authentication...",
      "Configuring white label...",
      "Running health checks...",
      "Provisioning complete!",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProvisioningLog((prev) => [...prev, steps[i]]);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setProvisioning(false);
        setCompleted(true);
      }
    }, 800);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Client Provisioning"
          description="Provision new client organizations."
          breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Provisioning" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>New Client Setup</CardTitle>
              <CardDescription>Configure a new organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Corp" icon={<Building2 className="h-4 w-4" />} />
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-border bg-transparent"
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>White Label</Label>
                    <p className="text-xs text-muted-foreground">Custom branding for this client</p>
                  </div>
                </div>
                <Switch checked={whiteLabel} onCheckedChange={setWhiteLabel} />
              </div>

              <Button
                onClick={startProvisioning}
                disabled={provisioning || !orgName || !plan}
                className="w-full gap-2"
                size="lg"
              >
                {provisioning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Rocket className="h-5 w-5" />
                )}
                {provisioning ? "Provisioning..." : completed ? "Provision Another" : "Start Provisioning"}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Provisioning Progress</CardTitle>
              <CardDescription>Live provisioning status.</CardDescription>
            </CardHeader>
            <CardContent>
              {!provisioning && !completed && (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <Rocket className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">Configure and start provisioning</p>
                </div>
              )}

              {(provisioning || completed) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${completed ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-[250px] overflow-y-auto space-y-1 bg-black/30 rounded-lg p-3">
                    {provisioningLog.map((log, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {i === provisioningLog.length - 1 && provisioning ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                        <span className={i === provisioningLog.length - 1 && provisioning ? "text-blue-400" : "text-emerald-400"}>{log}</span>
                      </div>
                    ))}
                  </div>

                  {completed && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                      <p className="text-sm text-emerald-500 font-medium">Client provisioned successfully!</p>
                      <p className="text-xs text-muted-foreground mt-1">Organization: {orgName}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
