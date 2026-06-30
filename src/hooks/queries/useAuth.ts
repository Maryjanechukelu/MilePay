"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi, onboardingApi, uploadApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { queryKeys } from "./queryKeys";
import type { AuthResponse, User } from "@/types";

// ─── Auth ─────────────────────────────────────────────────────────

/** Fetch the current authenticated user. Useful for refreshing profile
 *  state after onboarding/profile updates without a full page reload. */
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data as User;
    },
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await authApi.login(data);
      return res.data as AuthResponse;
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Invalid email or password");
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: string;
    }) => {
      const res = await authApi.register(data);
      return res.data as AuthResponse;
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      toast.success("Account created! Please verify your email.");
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Could not create account. Please try again."
      );
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    },
  });
}

// ─── Onboarding ───────────────────────────────────────────────────

/** Fetch the Nigerian bank list for bank-account dropdowns. */
export function useBanks() {
  return useQuery({
    queryKey: queryKeys.banks,
    queryFn: async () => {
      const res = await onboardingApi.getBanks();
      return (res.data.data ?? []) as { code: string; name: string }[];
    },
    staleTime: Infinity, // bank list essentially never changes within a session
  });
}

/** Resolve an account number + bank code into the account holder's name. */
export function useResolveBankAccount() {
  return useMutation({
    mutationFn: async ({
      bankCode,
      accountNumber,
    }: {
      bankCode: string;
      accountNumber: string;
    }) => {
      const res = await onboardingApi.resolveBank(bankCode, accountNumber);
      return res.data.data?.accountName as string;
    },
    onError: () => {
      toast.error("Could not verify account. Check the number and bank.");
    },
  });
}

export function useProviderProfileOnboarding() {
  return useMutation({
    mutationFn: async (data: {
      displayName: string;
      categories: string[];
      bio: string;
      portfolioUrl?: string;
      city: string;
      state: string;
    }) => onboardingApi.providerProfile(data),
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    },
  });
}

export function useProviderIdentityOnboarding() {
  return useMutation({
    mutationFn: async (data: {
      idType: "nin" | "voters_card" | "passport" | "drivers_licence";
      idNumber: string;
      idFrontFile: File;
      idBackFile?: File;
    }) => {
      const idFrontUrl = await uploadApi.uploadFile(data.idFrontFile);
      const idBackUrl = data.idBackFile ? await uploadApi.uploadFile(data.idBackFile) : undefined;
      return onboardingApi.providerIdentity({
        idType: data.idType,
        idNumber: data.idNumber,
        idFrontUrl,
        idBackUrl,
      });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not save identity info");
    },
  });
}

export function useConfirmProviderBank() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
      agreedToTerms: boolean;
    }) => onboardingApi.providerConfirmBank(data),
    onSuccess: () => {
      updateUser({ onboardingComplete: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Account activated! Welcome to MilePay.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not activate account");
    },
  });
}

export function useClientProfileOnboarding() {
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      phone: string;
      companyName?: string;
      city: string;
      state: string;
    }) => onboardingApi.clientProfile(data),
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    },
  });
}

export function useConfirmClientOnboarding() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => onboardingApi.clientConfirm(),
    onSuccess: () => {
      updateUser({ onboardingComplete: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Account activated! Welcome to MilePay.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not activate account");
    },
  });
}