"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectApi } from "@/lib/api";
import { queryKeys } from "./queryKeys";
import type { CreateProjectInput, Project } from "@/types";

// ─── Queries ──────────────────────────────────────────────────────

/** Fetch a single project (authenticated, full detail). */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ""),
    queryFn: async () => {
      const res = await projectApi.get(id!);
      return res.data.data as Project;
    },
    enabled: !!id,
  });
}

/** Fetch a project's public preview (no auth required). */
export function usePublicProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.public(id ?? ""),
    queryFn: async () => {
      const res = await projectApi.getPublic(id!);
      return res.data.data as Project;
    },
    enabled: !!id,
  });
}

/** Fetch the caller's project list, optionally filtered by role/state. */
export function useProjects(params?: {
  role?: string;
  state?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: async () => {
      const { projects } = await projectApi.list({
        role: "provider",
        state: params?.state,
        page: params?.page,
        limit: params?.limit,
      });
      return projects;
    },
  });
}

export function useProviderProjects(params: {
    state?: string;
    page: number;
    limit: number;
  }) {
    return useQuery({
      queryKey: ["projects", "provider", params],
      queryFn: () =>
        projectApi.list({
          role: "provider",
          state: params.state,
          page: params.page,
          limit: params.limit,
        }),
      placeholderData: keepPreviousData,
    });
  }

  /** Fetch a project's audit log. */
  export function useProjectAuditLog(id: string | undefined) {
    return useQuery({
      queryKey: queryKeys.projects.audit(id ?? ""),
      queryFn: async () => {
        const res = await projectApi.getAuditLog(id!);
        return res.data.data;
      },
      enabled: !!id,
    });
  }

  /**
   * Poll a project for payment confirmation. Used on the payment instructions
   * page — automatically stops polling once the project leaves PENDING_PAYMENT
   * / PARTIALLY_PAID states.
   */
  export function useProjectPaymentPolling(id: string | undefined) {
    return useQuery({
      queryKey: queryKeys.projects.detail(id ?? ""),
      queryFn: async () => {
        const res = await projectApi.get(id!);
        return res.data.data as Project;
      },
      enabled: !!id,
      refetchInterval: (query) => {
        const state = query.state.data?.state;
        const stillWaiting = state === "PENDING_PAYMENT" || state === "PARTIALLY_PAID";
        return stillWaiting ? 10_000 : false;
      },
    });
  }

  // ─── Mutations ────────────────────────────────────────────────────

  /** Create a new project. Invalidates the provider's project list and dashboard. */
  export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: CreateProjectInput & { totalAmount: number; currency: string }) => {
        const res = await projectApi.create(input);
        return res.data.data as Project;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.provider });
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not create project");
      },
    });
  }

  /** Client accepts a project — provisions the Nomba virtual account. */
  export function useAcceptProject() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const res = await projectApi.accept(id);
        return res.data.data as Project;
      },
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.public(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.client });
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not accept project");
      },
    });
  }

  /** Cancel a project. */
  export function useCancelProject() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
        const res = await projectApi.cancel(id, reason);
        return res.data.data as Project;
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success("Project cancelled");
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not cancel project");
      },
    });
  }