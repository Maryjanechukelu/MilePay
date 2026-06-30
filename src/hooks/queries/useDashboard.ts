"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "./queryKeys";
import type { ProviderDashboard, ClientDashboard } from "@/types";

/** Provider dashboard — stats, project list, recent payouts. */
export function useProviderDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.provider,
    queryFn: async () => {
      const res = await dashboardApi.provider();
      return res.data.data as ProviderDashboard;
    },
  });
}

/** Client dashboard — stats, funded projects, pending approvals. */
export function useClientDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.client,
    queryFn: async () => {
      const res = await dashboardApi.client();
      return res.data.data as ClientDashboard;
    },
  });
}