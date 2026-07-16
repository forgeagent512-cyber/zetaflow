"use client";

import { PageTransition } from "@/components/animations";
import { BlogCMS } from "@/components/cms";

export default function BlogCMSPage() {
  return (
    <PageTransition>
      <BlogCMS />
    </PageTransition>
  );
}
