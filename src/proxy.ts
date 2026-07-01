import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { de } from "zod/v4/locales";

// // ─── Route classification ─────────────────────────────────────────
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const PUBLIC_PREFIXES = [
  "/project/",   // public project preview + payment pages have their own internal auth checks
  "/p/",         // public provider profile pages
  "/_next",
  "/favicon",
  "/api/",
];

const PROVIDER_ONLY_PREFIXES = [
  "/dashboard",
  "/projects/new",
  "/earnings",
  "/onboarding/provider",
];

const CLIENT_ONLY_PREFIXES = [
  "/client-dashboard",
  "/onboarding/client",
];

const ADMIN_ONLY_PREFIXES = ["/admin"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes through
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Read auth state from cookie (mirrors Zustand persisted store)
  // The auth store also persists to localStorage for client-side reads,
  // but middleware runs on the edge and only has access to cookies.
  const token = request.cookies.get("mp_token")?.value;
  const roleCookie = request.cookies.get("mp_role")?.value;

  // No token at all — redirect to login, preserving intended destination
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-gated sections — redirect to the correct dashboard if role mismatches
  if (matchesPrefix(pathname, PROVIDER_ONLY_PREFIXES) && roleCookie && roleCookie !== "provider") {
    return NextResponse.redirect(new URL(fallbackForRole(roleCookie), request.url));
  }

  if (matchesPrefix(pathname, CLIENT_ONLY_PREFIXES) && roleCookie && roleCookie !== "client") {
    return NextResponse.redirect(new URL(fallbackForRole(roleCookie), request.url));
  }

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) && roleCookie && roleCookie !== "admin") {
    return NextResponse.redirect(new URL(fallbackForRole(roleCookie), request.url));
  }

  return NextResponse.next();
}

function fallbackForRole(role: string): string {
  switch (role) {
    case "provider": return "/dashboard";
    case "client":   return "/client-dashboard";
    case "admin":     return "/admin";
    default:          return "/login";
  }
}

// ─── Matcher config ────────────────────────────────────────────────
// Run middleware on everything except static assets and Next internals.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


// export default function proxy() {
//   // This file is a placeholder to prevent Next.js from throwing an error about missing the expected middleware file. The actual proxy logic has been moved to src/middleware.ts for better organization and to avoid confusion with the auth store.
//   // See src/middleware.ts for the real implementation.
// }