"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useSidebarStore } from "@/store/use-sidebar";
import { RequireAuth } from "@/components/layout/require-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <RequireAuth>
      <div className="min-h-screen">
        <Sidebar />
        <Topbar />
        <main
          className={cn(
            "relative pt-16 min-h-screen transition-all duration-300",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}