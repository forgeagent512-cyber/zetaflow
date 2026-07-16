"use client";

import { useState } from "react";
import { CreditCard, Pause, Play, XCircle, RefreshCw, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBillingStore } from "@/store/use-billing-store";
import { BILLING_PLANS, ADDON_PRICING } from "@/types";
import type { AddOnType } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SubscriptionManager() {
  const { subscription, cancelSubscription, pauseSubscription, resumeSubscription, updateSubscription, getPlanById } = useBillingStore();
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (!subscription) {
    return (
      <div className="glass rounded-xl py-16 text-center">
        <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-1">No Active Subscription</h3>
        <p className="text-sm text-muted-foreground">Choose a plan to get started.</p>
      </div>
    );
  }

  const currentPlan = getPlanById(subscription.planId);
  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "text-emerald-500 bg-emerald-500/10" },
    paused: { label: "Paused", color: "text-amber-500 bg-amber-500/10" },
    cancelled: { label: "Cancelled", color: "text-red-500 bg-red-500/10" },
    trialing: { label: "Trial", color: "text-blue-500 bg-blue-500/10" },
    grace: { label: "Grace Period", color: "text-amber-500 bg-amber-500/10" },
    expired: { label: "Expired", color: "text-muted-foreground bg-muted" },
  };
  const status = statusConfig[subscription.status];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    updateSubscription({ planId, planName: BILLING_PLANS.find((p) => p.id === planId)?.name || "" });
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      setSelectedPlan(null);
      toast.success("Plan upgraded successfully!");
    }, 2000);
  };

  const addonTotal = subscription.addOns.reduce((s, a) => s + a.price, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{currentPlan?.name || subscription.planName}</h3>
                <p className="text-sm text-muted-foreground capitalize">{subscription.interval} billing</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${subscription.price}<span className="text-sm font-normal text-muted-foreground">/{subscription.interval === "monthly" ? "mo" : "yr"}</span></p>
                {addonTotal > 0 && <p className="text-xs text-muted-foreground">+${addonTotal}/mo add-ons</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {subscription.status === "active" && (
                <>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { pauseSubscription(); toast.info("Subscription paused"); }}>
                    <Pause className="h-3 w-3" /> Pause
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1 text-red-500 hover:text-red-500" onClick={() => { cancelSubscription(); toast.warning("Subscription cancelled"); }}>
                    <XCircle className="h-3 w-3" /> Cancel
                  </Button>
                </>
              )}
              {subscription.status === "paused" && (
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { resumeSubscription(); toast.success("Subscription resumed"); }}>
                  <Play className="h-3 w-3" /> Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Add-Ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription.addOns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No add-ons purchased.</p>
            ) : (
              subscription.addOns.map((addon) => (
                <div key={addon.type} className="flex items-center justify-between text-sm">
                  <span>{addon.label} x{addon.quantity}</span>
                  <span className="font-medium">${addon.price}</span>
                </div>
              ))
            )}
            {Object.entries(ADDON_PRICING).map(([key, config]) => {
              const type = key as AddOnType;
              const owned = subscription.addOns.find((a) => a.type === type);
              if (owned) return null;
              return (
                <div key={key} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{config.label}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                    + Add <span className="text-muted-foreground">${config.unitPrice}</span>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Change Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BILLING_PLANS.filter((p) => p.id !== subscription.planId).map((plan) => {
              const isUpgrade = BILLING_PLANS.indexOf(plan) > BILLING_PLANS.indexOf(currentPlan || BILLING_PLANS[0]);
              return (
                <Card key={plan.id} className={cn("glass cursor-pointer hover:border-primary/30 transition-all", selectedPlan === plan.id && "border-primary")}>
                  <CardContent className="p-4 space-y-2" onClick={() => handleUpgrade(plan.id)}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{plan.name}</h4>
                      {isUpgrade ? <ArrowRight className="h-3.5 w-3.5 text-primary" /> : <RefreshCw className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                    <p className="text-lg font-bold">
                      ${plan.monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </p>
                    {upgrading && selectedPlan === plan.id && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Processing...
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
