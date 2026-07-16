"use client";

import { useState } from "react";
import { Check, X, Sparkles, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BILLING_PLANS } from "@/types";
import type { BillingPlan } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PlansPage() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (plan: BillingPlan) => {
    if (plan.tier === "enterprise") {
      toast.success("Enterprise plan inquiry submitted. Our team will contact you.");
      return;
    }
    toast.success(`You've selected the ${plan.name} plan (${interval}). Redirecting to checkout...`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-xs">Simple pricing</Badge>
        </div>
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Scale your AI workforce with plans designed for every business size.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-3 p-1 rounded-xl glass">
          <button
            onClick={() => setInterval("monthly")}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", interval === "monthly" && "bg-primary text-primary-foreground shadow-sm")}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", interval === "yearly" && "bg-primary text-primary-foreground shadow-sm")}
          >
            Yearly <Badge variant="outline" className="ml-1 text-[10px] text-emerald-500 border-emerald-500/30">Save 17%</Badge>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BILLING_PLANS.map((plan) => (
          <Card key={plan.id} className={cn(
            "glass relative transition-all duration-500 hover:shadow-xl hover:shadow-primary/5",
            plan.featured && "border-primary/40 shadow-lg shadow-primary/10 scale-[1.02]",
            plan.tier === "enterprise" && "bg-gradient-to-br from-primary/5 via-primary/5 to-background"
          )}>
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs px-3 py-1">Most Popular</Badge>
              </div>
            )}
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div>
                {plan.tier === "enterprise" ? (
                  <p className="text-2xl font-bold">Custom</p>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      ${interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{interval === "monthly" ? "mo" : "yr"}
                    </span>
                    {interval === "yearly" && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-emerald-500 mt-0.5">
                        ${Math.round(plan.yearlyPrice / 12)}/mo billed yearly
                      </p>
                    )}
                  </>
                )}
              </div>

              <Button
                className={cn("w-full", plan.featured ? "" : "variant-outline")}
                variant={plan.featured ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.tier === "enterprise" ? "Contact Sales" : `Choose ${plan.name}`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Includes</p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="glass rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Enterprise-Grade Security & Compliance</p>
        </div>
        <p className="text-xs text-muted-foreground">
          All plans include SOC 2 compliance, data encryption, and 99.9% uptime SLA. Enterprise plans include custom contracts, dedicated infrastructure, and on-premise deployment options.
        </p>
      </div>
    </div>
  );
}
