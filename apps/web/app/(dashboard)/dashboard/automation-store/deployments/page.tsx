"use client";

import { PageTransition } from "@/components/animations";
import { DeploymentHistory } from "@/components/cms";

export default function Page() {
  return (
    <PageTransition>
      <DeploymentHistory />
    </PageTransition>
  );
}
