"use client";

import { PageTransition, AnimatedSection } from "@/components/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Code, Wrench, Zap, Shield, GraduationCap, Search, MessageCircle } from "lucide-react";

const docsSections = [
  { id: "getting-started", name: "Getting Started", icon: Zap, description: "Set up your first AI employee in minutes.", articles: "12 articles" },
  { id: "guides", name: "Guides & Tutorials", icon: BookOpen, description: "Step-by-step guides for common use cases.", articles: "25 articles" },
  { id: "api-reference", name: "API Reference", icon: Code, description: "Complete API documentation for developers.", articles: "40+ endpoints" },
  { id: "integrations", name: "Integrations", icon: Wrench, description: "Connect with your favorite tools and services.", articles: "30+ integrations" },
  { id: "security", name: "Security & Compliance", icon: Shield, description: "Security best practices and compliance docs.", articles: "8 articles" },
  { id: "tutorials", name: "Video Tutorials", icon: GraduationCap, description: "Visual walkthroughs of platform features.", articles: "15 videos" },
  { id: "faq", name: "FAQ", icon: Search, description: "Frequently asked questions and troubleshooting.", articles: "50+ answers" },
  { id: "community", name: "Community", icon: MessageCircle, description: "Join our community forums and discussions.", articles: "Active" },
];

export default function DocumentationPage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="glass" className="mb-4">Docs</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale with the BUILDAGENT platform.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {docsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="glass group hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <CardDescription className="text-xs">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{section.articles}</span>
                    <Button variant="ghost" size="sm">Browse</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
