"use client";

import { PageTransition, AnimatedSection } from "@/components/animations";
import { Badge } from "@/components/ui/badge";

export default function DocumentationPage() {
  return (
    <PageTransition>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="glass" className="mb-4">Docs</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build and deploy with BUILDAGENT.
            </p>
          </AnimatedSection>
          <div className="text-center py-12 text-muted-foreground">
            <p>Documentation coming soon.</p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
