"use client";

import { PageTransition } from "@/components/animations";
import { NavBuilder } from "@/components/cms";

export default function NavBuilderPage() {
  return (
    <PageTransition>
      <NavBuilder />
    </PageTransition>
  );
}
