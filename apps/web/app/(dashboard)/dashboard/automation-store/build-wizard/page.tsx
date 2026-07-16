"use client";

import { PageTransition } from "@/components/animations";
import { BuildWizard } from "@/components/cms";

export default function Page() {
  return (
    <PageTransition>
      <BuildWizard />
    </PageTransition>
  );
}
