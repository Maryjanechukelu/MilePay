import { LayoutDashboard, AlertTriangle, RefreshCw, Receipt, BarChart3, Users, } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: "disputes" | "unmatched";
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin",              label: "Overview",           icon: LayoutDashboard },
  { href: "/admin/disputes",     label: "Disputes",           icon: AlertTriangle, countKey: "disputes" },
  { href: "/admin/unmatched",    label: "Unmatched payments",  icon: RefreshCw,     countKey: "unmatched" },
  { href: "/admin/transactions", label: "Transactions",       icon: Receipt },
  { href: "/admin/analytics",    label: "Analytics",          icon: BarChart3 },
  { href: "/admin/users",        label: "Users",              icon: Users },
];