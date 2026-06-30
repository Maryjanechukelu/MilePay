/**
 * Centralized query key factory. Keeping all keys here avoids typos and
 * makes cache invalidation predictable — e.g. invalidating queryKeys.projects.all
 * invalidates every project list/detail query at once.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  banks: ["banks"] as const,
  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, unknown>) =>
      ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    public: (id: string) => ["projects", "public", id] as const,
    audit: (id: string) => ["projects", "audit", id] as const,
    payments: (id: string) => ["projects", "payments", id] as const,
  },
  dashboard: {
    provider: ["dashboard", "provider"] as const,
    client: ["dashboard", "client"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) =>
      ["notifications", "list", params] as const,
  },
  admin: {
    disputes: ["admin", "disputes"] as const,
    unmatchedPayments: ["admin", "unmatched-payments"] as const,
    transactions: (params?: Record<string, unknown>) =>
      ["admin", "transactions", params] as const,
    users: (params?: Record<string, unknown>) =>
      ["admin", "users", params] as const,
  },
  provider: {
    publicProfile: (slug: string) => ["provider", "public", slug] as const,
  },
};