"use client";

import { PageTransition } from "@/components/animations";
import { EmailTemplates } from "@/components/cms";

export default function TemplateManagerPage() {
  return (
    <PageTransition>
      <EmailTemplates />
    </PageTransition>
  );
}