"use client";

import { PageTransition, AnimatedSection } from "@/components/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Stethoscope, Banknote, ShoppingBag, Truck, GraduationCap, Landmark } from "lucide-react";

const industries = [
  { id: "real-estate", name: "Real Estate", icon: Building2, description: "Automate lead capture, property matching, and client follow-ups.", count: "150+" },
  { id: "healthcare", name: "Healthcare", icon: Stethoscope, description: "Patient scheduling, intake forms, and compliance workflows.", count: "89+" },
  { id: "finance", name: "Finance & Banking", icon: Banknote, description: "Loan processing, fraud detection, and financial reporting.", count: "120+" },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingBag, description: "Order management, inventory sync, and customer support.", count: "200+" },
  { id: "logistics", name: "Logistics", icon: Truck, description: "Shipment tracking, route optimization, and delivery notifications.", count: "75+" },
  { id: "education", name: "Education", icon: GraduationCap, description: "Student enrollment, grading automation, and LMS integration.", count: "95+" },
  { id: "government", name: "Government", icon: Landmark, description: "Permit processing, public records, and citizen services.", count: "60+" },
  { id: "property", name: "Property Management", icon: Home, description: "Maintenance requests, tenant screening, and lease management.", count: "110+" },
];

export default function IndustriesPage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="glass" className="mb-4">Industries</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Built for Every Industry</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI workforce solutions tailored for your industry&apos;s unique needs and compliance requirements.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <Card key={industry.id} className="glass group hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{industry.name}</CardTitle>
                    <CardDescription>{industry.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{industry.count} automations</span>
                      <Button variant="ghost" size="sm">Explore</Button>
                    </div>
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
