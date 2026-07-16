"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, CreditCard, Settings2, Loader2, Rocket, CheckCircle2,
  ArrowLeft, ArrowRight, Check, FileText, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePurchasesStore } from "@/store/use-purchases-store";
import { useDeploymentsStore } from "@/store/use-deployments-store";
import type { StoreProduct, InstallStep, ProductLicense, StoreDeployment } from "@/types/cms";

interface InstallFlowProps {
  product: StoreProduct;
  open: boolean;
  onClose: () => void;
}

const steps: { id: InstallStep; label: string; icon: typeof ShoppingCart }[] = [
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "configuration", label: "Configure", icon: Settings2 },
  { id: "generating", label: "Generating", icon: Loader2 },
  { id: "deploying", label: "Deploying", icon: Rocket },
  { id: "success", label: "Complete", icon: CheckCircle2 },
];

export function InstallFlow({ product, open, onClose }: InstallFlowProps) {
  const [currentStep, setCurrentStep] = useState<InstallStep>("payment");
  const [stepIndex, setStepIndex] = useState(0);
  const [license, setLicense] = useState<ProductLicense>("single-company");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [deploying, setDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const { addPurchase } = usePurchasesStore();
  const { addDeployment } = useDeploymentsStore();

  const handlePayment = useCallback(() => {
    setCurrentStep("configuration");
    setStepIndex(1);
  }, []);

  const handleConfigure = useCallback(() => {
    setCurrentStep("generating");
    setStepIndex(2);
    setDeploying(true);
    const logs = [
      "Initializing deployment...",
      "Validating configuration...",
      "Provisioning resources...",
      "Configuring AI model...",
      "Establishing integrations...",
    ];
    logs.forEach((log, i) => {
      setTimeout(() => setDeploymentLogs((prev) => [...prev, log]), (i + 1) * 1500);
    });
    setTimeout(() => {
      setDeploying(false);
      setCurrentStep("deploying");
      setStepIndex(3);
      setTimeout(() => {
        setDeploymentLogs((prev) => [...prev, "Deployment complete!"]);
        setCurrentStep("success");
        setStepIndex(4);

        const dep: StoreDeployment = {
          id: `dep-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productIcon: product.media.icon,
          status: "running",
          config,
          logs: [],
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        addDeployment(dep);
        addPurchase({
          id: `p-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productIcon: product.media.icon,
          license,
          price: product.pricing.monthly || product.pricing.oneTime || 0,
          currency: product.pricing.currency,
          purchasedAt: new Date().toISOString(),
          deployments: [dep],
          updates: 1,
        });
        toast.success(`${product.name} has been installed successfully!`);
      }, 2000);
    }, 8000);
  }, [product, license, config, addDeployment, addPurchase]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && currentStep !== "success") onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Install {product.name}
          </DialogTitle>
          <DialogDescription>
            Complete the steps below to install and deploy {product.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between px-1">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all",
                i < stepIndex ? "bg-emerald-500 border-emerald-500 text-white" :
                i === stepIndex ? "bg-primary/10 border-primary text-primary" :
                "bg-muted border-muted-foreground/20 text-muted-foreground"
              )}>
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
              </div>
              <span className={cn("text-[10px] font-medium", i <= stepIndex ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="min-h-[280px]">
          {currentStep === "payment" && (
            <div className="space-y-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${product.pricing.monthly || product.pricing.oneTime || "—"}
                  <span className="text-sm font-normal text-muted-foreground">
                    {product.pricing.monthly ? "/month" : product.pricing.oneTime ? " once" : ""}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">+ ${product.pricing.maintenance}/mo maintenance</p>
              </div>

              <div>
                <Label className="text-xs mb-2 block">License Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["single-company", "agency", "unlimited", "enterprise"] as ProductLicense[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLicense(l)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all text-sm",
                        license === l ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="font-medium capitalize">{l.replace("-", " ")}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {l === "single-company" && "For one organization"}
                        {l === "agency" && "For agencies"}
                        {l === "unlimited" && "Unlimited use"}
                        {l === "enterprise" && "Custom terms"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 text-xs text-muted-foreground">
                <Lock className="h-4 w-4" />
                Secure payment processed via Stripe. Your card info is never stored.
              </div>

              <Button className="w-full" size="lg" onClick={handlePayment}>
                <CreditCard className="h-4 w-4 mr-2" /> Pay ${product.pricing.monthly || product.pricing.oneTime || 0}
              </Button>
            </div>
          )}

          {currentStep === "configuration" && (
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Configure your {product.name} deployment.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Deployment Name</Label>
                  <Input value={config.name || ""} onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))} placeholder="My AI Deployment" className="glass" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Environment</Label>
                  <select
                    value={config.environment || "production"}
                    onChange={(e) => setConfig((c) => ({ ...c, environment: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Additional Configuration</Label>
                <Input value={config.notes || ""} onChange={(e) => setConfig((c) => ({ ...c, notes: e.target.value }))} placeholder="Any special requirements?" className="glass" />
              </div>
              <Button className="w-full" size="lg" onClick={handleConfigure}>
                Continue to Deploy <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {(currentStep === "generating" || currentStep === "deploying") && (
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                <p className="font-medium">
                  {currentStep === "generating" ? "Generating your deployment..." : "Deploying to your environment..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This usually takes a few minutes.
                </p>
              </div>
              <div className="space-y-1 max-h-[180px] overflow-y-auto bg-muted/50 rounded-xl p-3">
                {deploymentLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="text-emerald-500">{">"}</span> {log}
                  </div>
                ))}
                {deploying && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono animate-pulse">
                    <span className="text-primary">_</span> Processing...
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === "success" && (
            <div className="text-center space-y-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Installation Complete!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.name} has been deployed and is now running.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <Rocket className="h-3 w-3" /> Running
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" /> v{product.version}
                </Badge>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
                <Button asChild>
                  <Link href="/dashboard/automation-store/deployments">
                    View Deployment <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


