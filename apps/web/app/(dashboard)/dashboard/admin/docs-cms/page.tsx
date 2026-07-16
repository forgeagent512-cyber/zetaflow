"use client";

import { PageTransition } from "@/components/animations";
import { DocsCMS } from "@/components/cms";

export default function DocsCMSPage() {
  return (
    <PageTransition>
      <DocsCMS />
    </PageTransition>
  );
}
