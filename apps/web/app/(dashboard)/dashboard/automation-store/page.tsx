"use client";

import { PageTransition } from "@/components/animations";
import { AutomationStore } from "@/components/cms";

export default function AutomationStorePage() {
  return (
    <PageTransition>
      <AutomationStore />
    </PageTransition>
  );
}
