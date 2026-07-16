"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: "client" | "admin";
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && isAuthenticated && requiredRole === "admin" && user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (requiredRole === "admin" && user?.role !== "admin") return null;

  return <>{children}</>;
}
