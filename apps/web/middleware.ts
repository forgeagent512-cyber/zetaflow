import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/automation-store",
  "/industries",
  "/documentation",
  "/enterprise",
  "/contact",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/google",
  "/api/auth/github",
  "/api/auth/oauth/callback",
];

const ADMIN_ROUTES = [
  "/dashboard/admin",
  "/api/admin",
];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

function isDashboardRoute(path: string): boolean {
  return path.startsWith("/dashboard") || path.startsWith("/api/dashboard");
}

function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get("buildagent-token")?.value ?? null;
}

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = getTokenFromCookies(request);
  const payload = token ? decodeTokenPayload(token) : null;
  const role = (payload?.role as string) ?? "public";
  const isAuthenticated = !!token && !!payload;

  if (isPublicRoute(pathname)) {
    if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
      const destination = role === "admin" ? "/dashboard/admin" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname) && role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute(pathname) && role === "public") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
