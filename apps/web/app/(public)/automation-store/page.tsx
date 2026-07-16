"use client";

import { PageTransition, AnimatedSection } from "@/components/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, Download, ArrowRight } from "lucide-react";

const featuredTemplates = [
  { id: "1", name: "Lead Capture & Qualification", category: "Sales", rating: 4.8, downloads: 1200, description: "Capture and qualify leads from multiple channels automatically." },
  { id: "2", name: "Customer Support Agent", category: "Support", rating: 4.9, downloads: 980, description: "24/7 AI-powered customer support with human handoff." },
  { id: "3", name: "CRM Sync & Management", category: "CRM", rating: 4.7, downloads: 850, description: "Keep your CRM updated with automatic contact enrichment." },
  { id: "4", name: "Email Marketing Automation", category: "Marketing", rating: 4.6, downloads: 720, description: "Personalized email campaigns with behavioral triggers." },
  { id: "5", name: "Invoice & Billing Manager", category: "Finance", rating: 4.8, downloads: 650, description: "Automated invoice generation and payment tracking." },
  { id: "6", name: "Social Media Scheduler", category: "Marketing", rating: 4.5, downloads: 590, description: "Schedule and publish across all social platforms." },
];

export default function AutomationStorePage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="glass" className="mb-4">Marketplace</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Automation Store</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse and install pre-built automation templates, integrations, and AI agents for your business.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search automations, integrations, agents..." className="pl-9" />
            </div>
          </AnimatedSection>

          <div className="mb-8">
            <div className="flex gap-2 flex-wrap justify-center">
              {["All", "Sales", "Marketing", "Support", "CRM", "Finance", "HR", "Operations"].map((cat) => (
                <Button key={cat} variant={cat === "All" ? "default" : "outline"} size="sm">{cat}</Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <Card key={template.id} className="glass group hover:shadow-lg transition-all">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{template.category}</Badge>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {template.rating}</span>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {template.downloads.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full group">
                    Install Template <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
