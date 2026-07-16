"use client";

import { RequireAuth } from "./require-auth";

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  return <RequireAuth requiredRole="admin">{children}</RequireAuth>;
}
