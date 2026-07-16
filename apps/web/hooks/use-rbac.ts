"use client";

import { useAuthStore } from "@/store/use-auth";
import type { UserRole } from "@/types";

const PUBLIC_ROUTES = ["/", "/pricing", "/automation-store", "/industries", "/documentation", "/enterprise", "/contact", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

const CLIENT_ROUTES = ["/dashboard", "/dashboard/projects", "/dashboard/employees", "/dashboard/agents", "/dashboard/automations", "/dashboard/deployments", "/dashboard/billing", "/dashboard/analytics", "/dashboard/settings", "/dashboard/notifications", "/dashboard/support"];

const ADMIN_ROUTES = [
  "/dashboard/admin",
  "/dashboard/admin/website-cms",
  "/dashboard/admin/automation-store-cms",
  "/dashboard/admin/pricing-cms",
  "/dashboard/admin/client-management",
  "/dashboard/admin/deployment-manager",
  "/dashboard/admin/analytics",
  "/dashboard/admin/theme-manager",
  "/dashboard/admin/settings",
  "/dashboard/admin/prompt-manager",
  "/dashboard/admin/template-manager",
  "/dashboard/admin/model-router",
  "/dashboard/admin/seo",
  "/dashboard/admin/geo",
  "/dashboard/admin/aeo",
  "/dashboard/admin/security",
  "/dashboard/admin/monitoring",
  "/dashboard/admin/white-label",
  "/dashboard/admin/system-settings",
  "/dashboard/admin/analytics-center",
  "/dashboard/admin/marketing-center",
  "/dashboard/admin/pricing-manager",
  "/dashboard/admin/client-manager",
  "/dashboard/admin/feature-flags",
  "/dashboard/admin/billing-admin",
  "/dashboard/admin/plans-manager",
  "/dashboard/admin/media-library",
  "/dashboard/admin/blog-cms",
  "/dashboard/admin/docs-cms",
  "/dashboard/admin/nav-builder",
  "/dashboard/admin/forms-builder",
  "/dashboard/admin/announcements",
  "/dashboard/admin/version-control",
  "/dashboard/admin/template-engine",
  "/dashboard/admin/admin-templates",
  "/dashboard/admin/store-admin",
  "/dashboard/admin/build-wizard",
  "/dashboard/admin/publish-to-store",
];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  public: PUBLIC_ROUTES,
  client: CLIENT_ROUTES,
  admin: [...CLIENT_ROUTES, ...ADMIN_ROUTES],
};

export function useRBAC() {
  const { user, isAuthenticated } = useAuthStore();
  const role: UserRole = user?.role ?? "public";

  function canAccess(path: string): boolean {
    const allowedRoutes = ROLE_ROUTES[role] ?? [];
    return allowedRoutes.some((route) => path === route || path.startsWith(route + "/"));
  }

  function isAdmin(): boolean {
    return role === "admin";
  }

  function isClient(): boolean {
    return role === "client";
  }

  function getDashboardRoute(): string {
    if (role === "admin") return "/dashboard/admin";
    return "/dashboard";
  }

  return {
    role,
    isAdmin,
    isClient,
    canAccess,
    getDashboardRoute,
    user,
    isAuthenticated,
  };
}
