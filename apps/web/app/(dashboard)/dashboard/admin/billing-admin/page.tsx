"use client";

import { PageTransition } from "@/components/animations";
import { AdminBillingPanel } from "@/components/billing";

export default function AdminBillingPage() {
  return (
    <PageTransition>
      <AdminBillingPanel />
    </PageTransition>
  );
}
