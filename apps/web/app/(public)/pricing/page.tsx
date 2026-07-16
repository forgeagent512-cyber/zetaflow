"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, AnimatedSection, StaggerWrapper, StaggerItem } from "@/components/animations";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small teams getting started with AI automation.",
    features: ["Up to 5 AI employees", "100 automation runs/month", "Basic analytics", "Email support", "1 project"],
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    description: "For growing teams that need more power and flexibility.",
    features: ["Up to 25 AI employees", "1,000 automation runs/month", "Advanced analytics", "Priority support", "Unlimited projects", "Custom integrations"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    description: "For organizations requiring enterprise-grade capabilities.",
    features: ["Unlimited AI employees", "Unlimited automation runs", "Real-time analytics", "24/7 dedicated support", "Unlimited projects", "Custom integrations", "SSO & SAML", "SLA guarantee"],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="glass" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </AnimatedSection>
          <StaggerWrapper className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <div className={`relative rounded-xl border p-8 h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/5' : 'glass'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default">Most Popular</Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="w-full">
                    <Button variant={plan.popular ? "default" : "outline"} className="w-full" size="lg">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerWrapper>
        </div>
      </section>
    </PageTransition>
  );
}
