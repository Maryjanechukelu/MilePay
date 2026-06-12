"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

interface UseAuthOptions {
  required?:      boolean;         // redirect to /login if not authenticated
  requiredRole?:  UserRole;        // redirect if wrong role
  redirectTo?:    string;          // override redirect destination
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = true, requiredRole, redirectTo } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (required && !isAuthenticated) {
      router.replace(redirectTo ?? "/login");
      return;
    }

    if (isAuthenticated && !user?.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    if (isAuthenticated && !user?.onboardingComplete) {
      router.replace(`/onboarding/${user?.role}`);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      const fallback =
        user?.role === "provider" ? "/dashboard" :
        user?.role === "client"   ? "/client-dashboard" :
        user?.role === "admin"    ? "/admin" : "/";
      router.replace(redirectTo ?? fallback);
    }
  }, [isAuthenticated, isLoading, user, required, requiredRole, redirectTo, router]);

  return { user, isAuthenticated, isLoading };
}
