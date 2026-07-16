"use client";

import Link from "next/link";
import { ArrowRight, Bot, Workflow, BarChart3, Shield, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, StaggerWrapper, StaggerItem, PageTransition } from "@/components/animations";

const features = [
  { icon: Bot, title: "AI Workforce", description: "Deploy intelligent autonomous agents that work 24/7 to automate your business processes." },
  { icon: Workflow, title: "Workflow Automation", description: "Design complex multi-step automation workflows with an intuitive visual builder." },
  { icon: BarChart3, title: "Real-time Analytics", description: "Monitor performance, track metrics, and gain insights across your entire operation." },
  { icon: Shield, title: "Enterprise Security", description: "Bank-grade encryption, role-based access control, and SOC 2 compliance." },
  { icon: Globe, title: "Global Scale", description: "Deploy across multiple regions with auto-scaling and 99.99% uptime SLA." },
  { icon: Zap, title: "Instant Integration", description: "Connect with 200+ tools and services through our extensive integration marketplace." },
];

export default function HomePage() {
  return (
    <PageTransition>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <AnimatedSection>
            <Badge variant="glass" className="mb-6 px-4 py-1.5 text-sm">
              Enterprise AI Workforce Operating System
            </Badge>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-gradient-white">
              Build Your AI
              <br />
              <span className="text-foreground">Workforce</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Design, deploy, and manage intelligent autonomous agents that transform how your organization operates at scale.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="xl" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete platform for building and managing your AI workforce at enterprise scale.
            </p>
          </AnimatedSection>
          <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="glass rounded-xl p-6 h-full hover:bg-white/5 transition-all duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerWrapper>
        </div>
      </section>

      <section className="py-24 px-6 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Operations?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of enterprises building their AI workforce with BUILDAGENT.
            </p>
            <Link href="/signup">
              <Button size="xl">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  );
}
