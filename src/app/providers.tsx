"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Wraps the app in a QueryClientProvider. The client is created inside
 * useState so each user session gets its own instance (avoids leaking
 * cached data across requests in SSR, and avoids re-creating the client
 * on every render on the client side).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30s — avoids redundant refetches
            // when navigating quickly between pages that share a query key.
            staleTime: 30 * 1000,
            // Keep unused data in cache for 5 minutes before garbage collecting.
            gcTime: 5 * 60 * 1000,
            // Refetch automatically when the user tabs back in — useful for
            // catching milestone state changes (webhooks) that happened
            // while they were away.
            refetchOnWindowFocus: true,
            // Don't endlessly retry on 4xx errors (bad request, unauthorized,
            // not found) — only retry on network/5xx failures.
            retry: (failureCount, error: unknown) => {
              const status = (error as { response?: { status?: number } })
                ?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
