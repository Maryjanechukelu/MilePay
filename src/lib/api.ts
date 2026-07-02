import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, Project, ProviderDashboard, ClientDashboard } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://milepay-blond.vercel.app/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request interceptor — attach JWT ─────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("mp_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — normalise errors ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: ApiError }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mp_token");
        localStorage.removeItem("mp_user");
        window.location.href = "/login";
      }
    }
    const apiError = error.response?.data?.error;
    if (apiError) {
      const err = new Error(apiError.message) as Error & {
        code?: string;
        field?: string;
      };
      err.code = apiError.code;
      err.field = apiError.field;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ───────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string; email: string; phone: string;
    password: string; role: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  verifyEmail: (token: string) =>
    api.post("/auth/verify-email", { token }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),

  me: () => api.get("/auth/me"),
};

// ─── File upload (pre-step before JSON submits below) ─────────────
// The backend expects already-hosted URLs (idFrontUrl, deliveryFiles: [...],
// etc.) rather than raw multipart files. This means files must be uploaded
// to a storage provider FIRST, and only the resulting URL is sent in the
// JSON body of the onboarding/milestone calls below.
//
// TODO: confirm the actual upload endpoint/provider with the backend dev
// (e.g. a signed Cloudinary upload, or a dedicated POST /uploads route).
// Until that's confirmed, this throws so callers fail loudly instead of
// silently sending broken data.
export const uploadApi = {
  uploadFile: async (_file: File): Promise<string> => {
    throw new Error(
      "File upload endpoint not yet confirmed with backend. " +
      "See TODO in uploadApi.uploadFile (src/lib/api.ts)."
    );
    // Once confirmed, this should look something like:
    // const fd = new FormData();
    // fd.append("file", _file);
    // const res = await api.post("/uploads", fd, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    // return res.data.data.url as string;
  },

  uploadFiles: async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map((f) => uploadApi.uploadFile(f)));
  },
};

// ─── Onboarding endpoints ────────────────────────────────────────
export const onboardingApi = {
  getBanks: () => api.get("/banks"),

  resolveBank: (bankCode: string, accountNumber: string) =>
    api.post("/onboarding/provider/bank", { bankCode, accountNumber }),

  // Step 1 — plain JSON, no file field per backend spec.
  // Profile photo upload (if/when supported) happens via uploadApi first,
  // and would need its own URL field added once the backend exposes one.
  providerProfile: (data: {
    displayName: string;
    categories: string[];
    bio: string;
    portfolioUrl?: string;
    city: string;
    state: string;
  }) => api.post("/onboarding/provider/profile", data),

  // Step 2 — JSON with already-uploaded URLs, not raw files.
  // Call uploadApi.uploadFile() for idFront/idBack/selfie first, then pass
  // the resulting URLs here.
  providerIdentity: (data: {
    idType: "nin" | "voters_card" | "passport" | "drivers_licence";
    idNumber: string;
    idFrontUrl: string;
    idBackUrl?: string;
    selfieUrl?: string;
  }) => api.post("/onboarding/provider/identity", data),

  providerConfirmBank: (data: {
    bankCode: string; accountNumber: string;
    accountName: string; agreedToTerms: boolean;
  }) => api.post("/onboarding/provider/confirm", data),

  clientProfile: (data: {
    fullName: string; phone: string;
    companyName?: string; city: string; state: string;
  }) => api.post("/onboarding/client/profile", data),

  clientConfirm: () =>
    api.post("/onboarding/client/confirm", { agreedToTerms: true }),
};

// ─── Project endpoints ────────────────────────────────────────────
function mapProject(raw: any): Project {
  return {
    ...raw,
    totalAmount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    amountPaid: Number(raw.amount_paid ?? raw.amountPaid ?? 0),
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    clientEmail: raw.client_email ?? raw.clientEmail,
    shareUrl: raw.share_url ?? raw.shareUrl,
    milestones: (raw.milestones ?? []).map((m: any) => ({
      ...m,
      amount: Number(m.amount ?? 0),
    })),
  };
}

export const projectApi = {
  create: (data: {
    title: string; description: string; clientEmail?: string;
    totalAmount: number;
    milestones: { title: string; description: string; deliverable: string; amount: number }[];
  }) => api.post("/projects", data),

  get: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return {
      ...res,
      data: {
        ...res.data,
        data: mapProject(res.data?.data ?? {}),
      },
    };
  },

  getPublic: async (id: string) => {
    const res = await api.get(`/projects/${id}/public`);
    return {
      ...res,
      data: {
        ...res.data,
        data: mapProject(res.data?.data ?? {}),
      },
    };
  },

  // Returns normalized projects + pagination meta, matching the actual
  // { success, data: { projects, total, page, limit, pages } } shape.
  list: async (params?: { role?: string; state?: string; page?: number; limit?: number }) => {
    const res = await api.get("/projects", { params });
    const raw = res.data?.data ?? {};
    return {
      projects: (raw.projects ?? []).map(mapProject) as Project[],
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      limit: raw.limit ?? 20,
      pages: raw.pages ?? 1,
    };
  },

  accept: (id: string) => api.post(`/projects/${id}/accept`),
  cancel: (id: string, reason: string) => api.post(`/projects/${id}/cancel`, { reason }),
  getAuditLog: (id: string) => api.get(`/projects/${id}/audit`),
  getPayments: (id: string) => api.get(`/projects/${id}/payments`),
};

// ─── Milestone endpoints ──────────────────────────────────────────
export const milestoneApi = {
  // JSON body — deliveryFiles are URLs uploaded beforehand via uploadApi.
  submit: (
    projectId: string,
    milestoneId: string,
    data: { deliveryNote: string; deliveryFiles?: string[] }
  ) => api.post(`/projects/${projectId}/milestones/${milestoneId}/submit`, data),

  approve: (projectId: string, milestoneId: string) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/approve`),

  requestRevision: (projectId: string, milestoneId: string, notes: string) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/request-revision`, { notes }),

  // JSON body — evidenceFiles are URLs uploaded beforehand via uploadApi.
  dispute: (
    projectId: string,
    milestoneId: string,
    data: { reason: string; description: string; evidenceFiles?: string[] }
  ) => api.post(`/projects/${projectId}/milestones/${milestoneId}/dispute`, data),

  counterEvidence: (
    projectId: string,
    milestoneId: string,
    data: { description: string; evidenceFiles?: string[] }
  ) => api.post(`/projects/${projectId}/milestones/${milestoneId}/counter-evidence`, data),

  // Was missing entirely — full milestone detail with submissions/evidence.
  getDetail: (projectId: string, milestoneId: string) =>
    api.get(`/projects/${projectId}/milestones/${milestoneId}`),
};

// ─── Dashboard (derived client-side — no backend route exists) ───
// The backend spec has no /dashboard/provider or /dashboard/client routes.
// Both are reconstructed here from GET /projects?role=... so the existing
// dashboard pages keep working without needing new backend endpoints.
export const dashboardApi = {
  provider: async () => {
    const { projects } = await projectApi.list({ role: "provider", limit: 100 });
    // const projects = ((res.data?.data?.projects ?? []) as any[]).map((p) => ({
    //   ...p,
    //   totalAmount: Number(p.total_amount ?? 0),
    //   createdAt: p.created_at,
    //   updatedAt: p.updated_at,
    //   milestones: p.milestones ?? [],
    // })) as Project[];

    const activeProjects = projects.filter((p) => p.state === "ACTIVE").length;
    const completedProjects = projects.filter((p) => p.state === "COMPLETED").length;

    const totalEarned = projects
      .flatMap((p) => p.milestones ?? [])
      .filter((m) => m.state === "PAID")
      .reduce((sum, m) => sum + m.amount, 0);

    const pendingAmount = projects
      .flatMap((p) => p.milestones ?? [])
      .filter((m) => m.state === "APPROVED" || m.state === "APPROVED_PENDING_TRANSFER")
      .reduce((sum, m) => sum + m.amount, 0);

    const completionRates = projects.length
      ? Math.round((completedProjects / projects.length) * 100)
      : 0;

    // Synthesize a "recent payments" list from paid milestones across
    // all projects, most recent first — there's no dedicated payments
    // endpoint for this, so it's derived from milestone data already
    // present on each project.
    const recentPayments = projects
      .flatMap((p) =>
        (p.milestones ?? [])
          .filter((m) => m.state === "PAID" && m.paidAt)
          .map((m) => ({
            id: m.id,
            projectId: p.id,
            reference: m.id,
            amount: m.amount,
            currency: "NGN" as const,
            type: "outbound" as const,
            status: "success" as const,
            narration: `${p.title} — ${m.title}`,
            milestoneId: m.id,
            createdAt: m.paidAt!,
          }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const dashboard: ProviderDashboard = {
      stats: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalEarned,
        pendingAmount,
        avgCompletionRate: completionRates,
      },
      projects,
      recentPayments,
    };

    return { data: { data: dashboard } };
  },

  client: async () => {
    const { projects } = await projectApi.list({ role: "provider", limit: 100 });
    // const projects = ((res.data?.data?.projects ?? []) as any[]).map((p) => ({
    //   ...p,
    //   totalAmount: Number(p.total_amount ?? 0),
    //   createdAt: p.created_at,
    //   updatedAt: p.updated_at,
    //   milestones: p.milestones ?? [],
    // })) as Project[];

    const activeProjects = projects.filter((p) => p.state === "ACTIVE").length;
    const completedProjects = projects.filter((p) => p.state === "COMPLETED").length;

    const totalSpent = projects
      .flatMap((p) => p.milestones ?? [])
      .filter((m) => m.state === "PAID")
      .reduce((sum, m) => sum + m.amount, 0);

    const pendingApprovals = projects
      .flatMap((p) => p.milestones ?? [])
      .filter((m) => m.state === "SUBMITTED").length;

    const dashboard: ClientDashboard = {
      stats: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalSpent,
        pendingApprovals,
      },
      projects,
    };

    return { data: { data: dashboard } };
  },
};

// ─── Admin endpoints ──────────────────────────────────────────────
export const adminApi = {
  // `outcome` filter added — was accepted by the backend but unused here.
  getDisputes: (params?: {
    outcome?: "PENDING" | "RELEASED_TO_PROVIDER" | "REFUNDED_TO_CLIENT";
    page?: number;
    limit?: number;
  }) => api.get("/admin/disputes", { params }),

  resolveDispute: (
    id: string,
    outcome: "release" | "refund",
    notes: string
  ) => api.post(`/admin/disputes/${id}/resolve`, { outcome, notes }),

  getUnmatchedPayments: () => api.get("/admin/unmatched-payments"),

  resolveUnmatched: (id: string, action: "match" | "return", projectId?: string) =>
    api.post(`/admin/unmatched-payments/${id}/resolve`, { action, projectId }),

  getTransactions: (params?: { page?: number; limit?: number; state?: string }) =>
    api.get("/admin/transactions", { params }),

  getUsers: (params?: { role?: string; page?: number }) =>
    api.get("/admin/users", { params }),

  verifyUser: (id: string) => api.post(`/admin/users/${id}/verify`),

  suspendUser: (id: string, reason: string) =>
    api.post(`/admin/users/${id}/suspend`, { reason }),
};

// ─── Notifications endpoints ──────────────────────────────────────
// Only GET /notifications is confirmed in the backend spec. The two
// mark-read routes below are NOT in the spec — left in place since they're
// low-risk no-ops if missing, but flagged here for backend confirmation.
export const notificationApi = {
  list: (params?: { unread?: boolean; page?: number }) =>
    api.get("/notifications", { params }),

  // TODO: confirm this route exists on the backend.
  markRead: (id: string) => api.post(`/notifications/${id}/read`),

  // TODO: confirm this route exists on the backend.
  markAllRead: () => api.post("/notifications/read-all"),
};

// ─── Public provider profile ──────────────────────────────────────
// TODO: no backend route for this exists anywhere in the provided spec.
// There is no public "list/lookup provider by slug" endpoint, and nothing
// else exposes provider data without auth. This will 404 until the
// backend adds something like GET /providers/:slug.
export const providerApi = {
  getPublicProfile: (slug: string) => api.get(`/providers/${slug}`),
};

export default api;