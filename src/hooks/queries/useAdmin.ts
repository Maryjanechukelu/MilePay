"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { queryKeys } from "./queryKeys";
import type { MilestoneDispute, Payment } from "@/types";

// ─── Queries ──────────────────────────────────────────────────────

export function useAdminDisputes(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.admin.disputes,
    queryFn: async () => {
      const res = await adminApi.getDisputes(params);
      return (res.data.data ?? []) as MilestoneDispute[];
    },
  });
}

export function useAdminUnmatchedPayments() {
  return useQuery({
    queryKey: queryKeys.admin.unmatchedPayments,
    queryFn: async () => {
      const res = await adminApi.getUnmatchedPayments();
      return (res.data.data ?? []) as Payment[];
    },
  });
}

export function useAdminTransactions(params?: {
  page?: number;
  limit?: number;
  state?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.transactions(params),
    queryFn: async () => {
      const res = await adminApi.getTransactions(params);
      return res.data;
    },
  });
}

export function useAdminUsers(params?: { role?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: async () => {
      const res = await adminApi.getUsers(params);
      return res.data;
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────

/** Resolve a dispute — releases funds to provider or refunds client. */
export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      outcome,
      notes,
    }: {
      id: string;
      outcome: "release" | "refund";
      notes: string;
    }) => adminApi.resolveDispute(id, outcome, notes),
    onSuccess: (_data, { outcome }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.disputes });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success(
        outcome === "release"
          ? "Funds released to provider"
          : "Refund issued to client"
      );
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not resolve dispute");
    },
  });
}

/** Resolve an unmatched/misdirected payment — match it to a project or return it. */
export function useResolveUnmatchedPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      projectId,
    }: {
      id: string;
      action: "match" | "return";
      projectId?: string;
    }) => adminApi.resolveUnmatched(id, action, projectId),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.unmatchedPayments });
      toast.success(
        action === "return" ? "Payment returned to sender" : "Payment matched to project"
      );
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not resolve payment");
    },
  });
}

/** Mark a provider's ID as verified — unlocks the verified badge. */
export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => adminApi.verifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User verified");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not verify user");
    },
  });
}

/** Suspend a user account. */
export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User suspended");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not suspend user");
    },
  });
}