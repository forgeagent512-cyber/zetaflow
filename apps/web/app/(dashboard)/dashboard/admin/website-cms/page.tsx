"use client";

import { PageTransition } from "@/components/animations";
import { WebsiteBuilder } from "@/components/cms";

export default function WebsiteCMSPage() {
  return (
    <PageTransition>
      <WebsiteBuilder />
    </PageTransition>
  );
}