"use client";

import { PageTransition } from "@/components/animations";
import { ThemeBuilder } from "@/components/cms";

export default function ThemeManagerPage() {
  return (
    <PageTransition>
      <ThemeBuilder />
    </PageTransition>
  );
}