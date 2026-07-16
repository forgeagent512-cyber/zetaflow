"use client";

import { PageTransition } from "@/components/animations";
import { MyPurchases } from "@/components/cms";

export default function Page() {
  return (
    <PageTransition>
      <MyPurchases />
    </PageTransition>
  );
}
