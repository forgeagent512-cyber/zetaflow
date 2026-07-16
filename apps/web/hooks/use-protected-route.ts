"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/use-auth";
import { useRBAC } from "./use-rbac";

export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { canAccess } = useRBAC();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !pathname.startsWith("/api/")) {
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/automation-store") ||
        pathname.startsWith("/industries") ||
        pathname.startsWith("/documentation") ||
        pathname.startsWith("/enterprise") ||
        pathname.startsWith("/contact") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/verify-email");

      if (!isPublic) {
        router.push("/login");
      }
      return;
    }

    if (isAuthenticated && !canAccess(pathname)) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, pathname, router, canAccess]);
}
