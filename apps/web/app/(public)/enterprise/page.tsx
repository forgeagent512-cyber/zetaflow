"use client";

import { PageTransition, AnimatedSection } from "@/components/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Server, Lock, Globe, Sliders, CheckCircle, ArrowRight } from "lucide-react";

const features = [
  { id: "sso", name: "Single Sign-On", icon: Lock, description: "SAML, OAuth, and OpenID Connect support." },
  { id: "rbac", name: "RBAC & Permissions", icon: Shield, description: "Granular role-based access control." },
  { id: "audit", name: "Audit Logging", icon: Sliders, description: "Complete audit trail of all platform activity." },
  { id: "sla", name: "99.99% SLA", icon: Server, description: "Enterprise-grade reliability guarantee." },
  { id: "dedicated", name: "Dedicated Infrastructure", icon: Globe, description: "Isolated infrastructure for your organization." },
  { id: "team", name: "Unlimited Teams", icon: Users, description: "Organize employees, departments, and projects." },
];

const plans = [
  { name: "Business", price: "$149", users: "25", employees: "Unlimited", workflows: "Unlimited", popular: false },
  { name: "Enterprise", price: "$499", users: "999", employees: "Unlimited", workflows: "Unlimited", popular: true },
  { name: "Custom", price: "Custom", users: "Unlimited", employees: "Unlimited", workflows: "Unlimited", popular: false },
];

export default function EnterprisePage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="glass" className="mb-4">Enterprise</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise-Grade AI Workforce Platform</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Security, compliance, and scale for the world&apos;s largest organizations. Deploy AI employees with enterprise-grade controls.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="glass">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{feature.name}</CardTitle>
                        <CardDescription className="text-xs">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <AnimatedSection className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Enterprise Plans</h2>
            <p className="text-muted-foreground">Choose the plan that fits your organization&apos;s needs.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`glass ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      `Up to ${plan.users} users`,
                      `${plan.employees} AI employees`,
                      `${plan.workflows} workflows`,
                      "Priority support",
                      ...(plan.name === "Enterprise" ? ["Dedicated infrastructure", "Custom SLA", "White labeling"] : []),
                      ...(plan.name === "Custom" ? ["Everything in Enterprise", "Custom development", "On-premise deployment"] : []),
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardContent>
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                    {plan.name === "Custom" ? "Contact Sales" : "Get Started"} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
