"use client";

import { PageTransition } from "@/components/animations";
import { FormsBuilder } from "@/components/cms";

export default function FormsBuilderPage() {
  return (
    <PageTransition>
      <FormsBuilder />
    </PageTransition>
  );
}
