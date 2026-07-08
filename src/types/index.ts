// ─── Enums ────────────────────────────────────────────────────────
export type UserRole = "provider" | "client" | "admin";

export type ProjectState =
  | "DRAFT"
  | "PENDING_ACCEPTANCE"
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID"
  | "ACTIVE"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "REFUNDED";

export type MilestoneState =
  | "LOCKED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "APPROVED_PENDING_TRANSFER"
  | "PAID"
  | "DISPUTED"
  | "REFUNDED";

export type ServiceCategory =
  | "development"
  | "design"
  | "tutoring"
  | "consulting"
  | "photography"
  | "writing"
  | "video"
  | "other";

export type DisputeReason =
  | "work_not_delivered"
  | "poor_quality"
  | "not_as_described"
  | "incomplete_delivery"
  | "other";

export type DisputeOutcome = "release" | "refund";

// ─── User & Auth ──────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  onboardingComplete: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile?: ProviderProfile | ClientProfile;
}

export interface ProviderProfile {
  displayName: string;
  categories: ServiceCategory[];
  bio: string;
  portfolioUrl?: string;
  city: string;
  state: string;
  avatarUrl?: string;
  idVerified: boolean;
  bankAccount?: BankAccount;
  trustScore: number;
  completedProjects: number;
  totalEarned: number;
  slug: string;
}

export interface ClientProfile {
  fullName: string;
  companyName?: string;
  city: string;
  state: string;
  avatarUrl?: string;
  totalProjects: number;
  totalSpent: number;
}

export interface BankAccount {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Project & Milestone ──────────────────────────────────────────
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deliverable: string;
  amount: number;
  position: number;
  state: MilestoneState;
  deliveryNote?: string;
  deliveryFiles?: UploadedFile[];
  revisionNotes?: RevisionNote[];
  dispute?: MilestoneDispute;
  approvedAt?: string;
  paidAt?: string;
  autoApproveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  providerId: string;
  clientId?: string;
  provider: ProviderProfile;
  client?: ClientProfile;
  totalAmount: number;
  currency: "NGN";
  state: ProjectState;
  milestones: Milestone[];
  virtualAccount?: VirtualAccount;
  payments: Payment[];
  auditLog: AuditEvent[];
  shareUrl: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  clientEmail?: string;
  totalAmount: number;
  milestones: CreateMilestoneInput[];
}

export interface CreateMilestoneInput {
  title: string;
  description: string;
  deliverable: string;
  amount: number;
}

// ─── Payments & Virtual Accounts ─────────────────────────────────
export interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  projectId: string;
  balance: number;
  expectedAmount: number;
  paidAmount: number;
  overpayment: number;
  underpayment: number;
}

export interface Payment {
  id: string;
  projectId: string;
  reference: string;
  amount: number;
  currency: "NGN";
  type: "inbound" | "outbound";
  status: "pending" | "success" | "failed" | "unmatched";
  narration?: string;
  webhookId?: string;
  milestoneId?: string;
  createdAt: string;
}

// ─── Disputes ─────────────────────────────────────────────────────
export interface MilestoneDispute {
  id: string;
  milestoneId: string;
  projectId: string;
  raisedBy: "client";
  reason: DisputeReason;
  description: string;
  clientEvidence: UploadedFile[];
  providerEvidence?: UploadedFile[];
  providerResponse?: string;
  outcome?: DisputeOutcome;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Supporting types ─────────────────────────────────────────────
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface RevisionNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: "client";
}

export interface AuditEvent {
  id: string;
  projectId: string;
  event: string;
  description: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type:
  | "project_funded"
  | "milestone_submitted"
  | "milestone_approved"
  | "milestone_paid"
  | "revision_requested"
  | "dispute_raised"
  | "dispute_resolved"
  | "payment_received"
  | "auto_approved";
  read: boolean;
  projectId?: string;
  milestoneId?: string;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────
export interface ProviderDashboard {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalEarned: number;
    pendingAmount: number;
    trustScore: number;
    avgCompletionRate: number;
    isVerified: string;
  };
  projects: Project[];
  recentPayments: Payment[];
  unreadNotifications: number;
}

export interface ClientDashboard {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalSpent: number;
    pendingApprovals: number;
  };
  projects: Project[];
  unreadNotifications: number;
}

export interface AdminDashboard {
  stats: {
    totalProjects: number;
    activeProjects: number;
    openDisputes: number;
    unmatchedPayments: number;
    totalVolume: number;
    totalFees: number;
  };
  disputes: MilestoneDispute[];
  unmatchedPayments: Payment[];
}

// ─── API ──────────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Forms ────────────────────────────────────────────────────────
export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ProviderOnboardingStep1 {
  displayName: string;
  categories: ServiceCategory[];
  bio: string;
  portfolioUrl?: string;
  city: string;
  state: string;
}

export interface ProviderOnboardingStep2 {
  idType: "nin" | "voters_card" | "passport" | "drivers_licence";
  idNumber: string;
  idFront: File;
  idBack?: File;
  selfie?: File;
}

export interface ProviderOnboardingStep3 {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface ClientOnboardingStep1 {
  fullName: string;
  phone: string;
  companyName?: string;
  city: string;
  state: string;
}
