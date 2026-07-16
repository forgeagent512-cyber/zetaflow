"use client";

import { PageTransition } from "@/components/animations";
import { AutomationStore } from "@/components/cms";

export default function AutomationStoreCMSPage() {
  return (
    <PageTransition>
      <AutomationStore />
    </PageTransition>
  );
}