"use client";

import { PageTransition } from "@/components/animations";
import { CustomerBillingPortal } from "@/components/billing";

export default function BillingPage() {
  return (
    <PageTransition>
      <CustomerBillingPortal />
    </PageTransition>
  );
}
