"use client";

import { PageTransition } from "@/components/animations";
import { AdminControls } from "@/components/cms";

export default function StoreAdminPage() {
  return (
    <PageTransition>
      <AdminControls />
    </PageTransition>
  );
}
