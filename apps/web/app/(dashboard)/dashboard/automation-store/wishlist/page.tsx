"use client";

import { PageTransition } from "@/components/animations";
import { WishlistPage } from "@/components/cms";

export default function Page() {
  return (
    <PageTransition>
      <WishlistPage />
    </PageTransition>
  );
}
