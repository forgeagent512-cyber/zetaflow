"use client";

import { PageTransition } from "@/components/animations";
import { MediaLibrary } from "@/components/cms";

export default function MediaLibraryPage() {
  return (
    <PageTransition>
      <MediaLibrary />
    </PageTransition>
  );
}
