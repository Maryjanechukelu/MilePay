import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.milepay.ng/v1";

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

// ─── Onboarding endpoints ────────────────────────────────────────
export const onboardingApi = {
  getBanks: () => api.get("/banks"),

  resolveBank: (bankCode: string, accountNumber: string) =>
    api.post("/onboarding/provider/bank", { bankCode, accountNumber }),

  providerProfile: (data: FormData) =>
    api.post("/onboarding/provider/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  providerIdentity: (data: FormData) =>
    api.post("/onboarding/provider/identity", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

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
export const projectApi = {
  create: (data: {
    title: string; description: string; clientEmail?: string;
    totalAmount: number;
    milestones: { title: string; description: string; deliverable: string; amount: number }[];
  }) => api.post("/projects", data),

  get: (id: string) => api.get(`/projects/${id}`),

  getPublic: (id: string) => api.get(`/projects/${id}/public`),

  list: (params?: { role?: string; state?: string; page?: number; limit?: number }) =>
    api.get("/projects", { params }),

  accept: (id: string) => api.post(`/projects/${id}/accept`),

  cancel: (id: string, reason: string) =>
    api.post(`/projects/${id}/cancel`, { reason }),

  getAuditLog: (id: string) => api.get(`/projects/${id}/audit`),

  getPayments: (id: string) => api.get(`/projects/${id}/payments`),
};

// ─── Milestone endpoints ──────────────────────────────────────────
export const milestoneApi = {
  submit: (projectId: string, milestoneId: string, data: FormData) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/submit`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  approve: (projectId: string, milestoneId: string) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/approve`),

  requestRevision: (projectId: string, milestoneId: string, notes: string) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/request-revision`, { notes }),

  dispute: (projectId: string, milestoneId: string, data: FormData) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/dispute`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  counterEvidence: (projectId: string, milestoneId: string, data: FormData) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/counter-evidence`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Dashboard endpoints ──────────────────────────────────────────
export const dashboardApi = {
  provider: () => api.get("/dashboard/provider"),
  client: () => api.get("/dashboard/client"),
};

// ─── Admin endpoints ──────────────────────────────────────────────
export const adminApi = {
  getDisputes: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/disputes", { params }),

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
export const notificationApi = {
  list: (params?: { unread?: boolean; page?: number }) =>
    api.get("/notifications", { params }),

  markRead: (id: string) => api.post(`/notifications/${id}/read`),

  markAllRead: () => api.post("/notifications/read-all"),
};

export default api;
