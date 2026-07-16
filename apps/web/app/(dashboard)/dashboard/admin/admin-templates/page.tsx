"use client";

import { PageTransition } from "@/components/animations";
import { AdminTemplateManager } from "@/components/cms";

export default function AdminTemplatesPage() {
  return (
    <PageTransition>
      <AdminTemplateManager />
    </PageTransition>
  );
}
