import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import type { ProjectState, MilestoneState, ServiceCategory } from "@/types";
import {
  CodeIcon,
  PaintBoardIcon,
  BookOpen02Icon,
  Briefcase01Icon,
  Camera01Icon,
  PencilEdit02Icon,
  VideoReplayIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
// import type { IconSvgElement } from "@hugeicons/core-free-icons";


// ─── Tailwind class merge ─────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting ─────────────────────────────────────────
export function formatNaira(
  amount: number,
  options?: { compact?: boolean; showDecimals?: boolean }
): string {
  if (options?.compact) {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: options?.showDecimals ? 2 : 0,
    maximumFractionDigits: options?.showDecimals ? 2 : 0,
  }).format(amount);
}

// ─── Date formatting ──────────────────────────────────────────────
export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(
  date: string | Date,
  pattern = "d MMM yyyy"
): string {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "d MMM yyyy, h:mm a");
}

export function hoursUntil(date: string | Date): number {
  return differenceInHours(new Date(date), new Date());
}

// ─── State labels & colours ───────────────────────────────────────
export const PROJECT_STATE_CONFIG: Record<
  ProjectState,
  { label: string; badgeClass: string; dot: string }
> = {
  DRAFT:              { label: "Draft",            badgeClass: "badge-slate",  dot: "bg-slate-400" },
  PENDING_ACCEPTANCE: { label: "Pending Acceptance",badgeClass: "badge-slate",  dot: "bg-slate-400" },
  PENDING_PAYMENT:    { label: "Awaiting Payment",  badgeClass: "badge-amber",  dot: "bg-amber-500" },
  PARTIALLY_PAID:     { label: "Partially Paid",    badgeClass: "badge-amber",  dot: "bg-amber-400" },
  ACTIVE:             { label: "Active",            badgeClass: "badge-blue",   dot: "bg-blue-500"  },
  COMPLETED:          { label: "Completed",         badgeClass: "badge-green",  dot: "bg-forest-500"},
  DISPUTED:           { label: "Disputed",          badgeClass: "badge-red",    dot: "bg-red-500"   },
  CANCELLED:          { label: "Cancelled",         badgeClass: "badge-slate",  dot: "bg-slate-400" },
  REFUNDED:           { label: "Refunded",          badgeClass: "badge-purple", dot: "bg-purple-500"},
};

export const MILESTONE_STATE_CONFIG: Record<
  MilestoneState,
  { label: string; badgeClass: string }
> = {
  LOCKED:                    { label: "Locked",               badgeClass: "badge-slate"  },
  IN_PROGRESS:               { label: "In Progress",          badgeClass: "badge-blue"   },
  SUBMITTED:                 { label: "Submitted",            badgeClass: "badge-amber"  },
  REVISION_REQUESTED:        { label: "Revision Requested",   badgeClass: "badge-amber"  },
  APPROVED:                  { label: "Approved",             badgeClass: "badge-green"  },
  APPROVED_PENDING_TRANSFER: { label: "Paying out…",          badgeClass: "badge-amber"  },
  PAID:                      { label: "Paid",                 badgeClass: "badge-green"  },
  DISPUTED:                  { label: "Disputed",             badgeClass: "badge-red"    },
  REFUNDED:                  { label: "Refunded",             badgeClass: "badge-purple" },
};

// ─── Service categories ───────────────────────────────────────────
export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  development:  "Software Development",
  design:       "Design & Branding",
  tutoring:     "Tutoring & Teaching",
  consulting:   "Consulting",
  photography:  "Photography & Video",
  writing:      "Writing & Content",
  video:        "Video Production",
  other:        "Other Services",
};

export const CATEGORY_ICONS = {
  development: CodeIcon,
  design: PaintBoardIcon,
  tutoring: BookOpen02Icon,
  consulting: Briefcase01Icon,
  photography: Camera01Icon,
  writing: PencilEdit02Icon,
  video: VideoReplayIcon,
  other: SparklesIcon,
} satisfies Record<ServiceCategory, typeof CodeIcon>;

// ─── Nigerian states ──────────────────────────────────────────────
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT — Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// ─── Platform fee calculation ────────────────────────────────────
export const PLATFORM_FEE_PERCENT = 2;

export function calculateFee(amount: number): {
  fee: number;
  providerReceives: number;
} {
  const fee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
  return { fee, providerReceives: amount - fee };
}

// ─── File size formatting ─────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Truncate text ────────────────────────────────────────────────
export function truncate(str: string, length = 60): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

// ─── Generate initials ────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Copy to clipboard ───────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Milestone progress ──────────────────────────────────────────
export function getMilestoneProgress(milestones: { state: MilestoneState }[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.state === "PAID").length;
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

// ─── Phone formatting ─────────────────────────────────────────────
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  return `+234${cleaned}`;
}

// ─── Share URL ────────────────────────────────────────────────────
export function getProjectShareUrl(projectId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/project/${projectId}`;
  }
  return `https://milepay.ng/project/${projectId}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 15) {
    return "Sunny Afternoon";
  }
  if (hour >= 15 && hour < 18) {
    return "Good Afternoon";
  }
  if (hour >= 18 && hour < 21) {
    return "Good Evening";
  }
  return "Rise and Shine";
}