"use client";

import { PageTransition } from "@/components/animations";
import { VersionControl } from "@/components/cms";

export default function VersionControlPage() {
  return (
    <PageTransition>
      <VersionControl />
    </PageTransition>
  );
}
