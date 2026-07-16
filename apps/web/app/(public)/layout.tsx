import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";

export default function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </PublicLayout>
  );
}