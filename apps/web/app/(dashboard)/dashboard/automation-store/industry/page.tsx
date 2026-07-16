"use client";

import { PageTransition } from "@/components/animations";
import { IndustryLibrary } from "@/components/cms";

export default function Page() {
  return (
    <PageTransition>
      <IndustryLibrary />
    </PageTransition>
  );
}
