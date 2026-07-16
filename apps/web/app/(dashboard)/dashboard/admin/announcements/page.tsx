"use client";

import { PageTransition } from "@/components/animations";
import { AnnouncementsCenter } from "@/components/cms";

export default function AnnouncementsPage() {
  return (
    <PageTransition>
      <AnnouncementsCenter />
    </PageTransition>
  );
}
