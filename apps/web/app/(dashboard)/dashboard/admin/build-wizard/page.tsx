"use client";

import { PageTransition } from "@/components/animations";
import { BuildWizard } from "@/components/cms";

export default function AdminBuildWizardPage() {
  return (
    <PageTransition>
      <BuildWizard />
    </PageTransition>
  );
}
