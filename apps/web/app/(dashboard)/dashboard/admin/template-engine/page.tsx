"use client";

import { PageTransition } from "@/components/animations";
import { TemplateEngine } from "@/components/cms";

export default function TemplateEnginePage() {
  return (
    <PageTransition>
      <TemplateEngine />
    </PageTransition>
  );
}
