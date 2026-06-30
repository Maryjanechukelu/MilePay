"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { queryKeys } from "./queryKeys";
import type { Notification } from "@/types";

/** Fetch notifications, optionally filtered to unread only. */
export function useNotifications(params?: { unread?: boolean; page?: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: async () => {
      const res = await notificationApi.list(params);
      return (res.data.data ?? []) as Notification[];
    },
    // Notifications change often (milestone events, payments) — refetch
    // every 30s while the tab is active so badges stay current.
    refetchInterval: 30_000,
  });
}

/** Mark a single notification as read. Optimistically updates the cache. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => notificationApi.markRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const previous = queryClient.getQueriesData<Notification[]>({
        queryKey: queryKeys.notifications.all,
      });
      queryClient.setQueriesData<Notification[]>(
        { queryKey: queryKeys.notifications.all },
        (old) => old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/** Mark all notifications as read. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueriesData<Notification[]>(
        { queryKey: queryKeys.notifications.all },
        (old) => old?.map((n) => ({ ...n, read: true }))
      );
    },
  });
}