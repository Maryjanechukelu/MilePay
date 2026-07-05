import {
  DashboardCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  Invoice04Icon,
  ChartLineData02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof DashboardCircleIcon;
  countKey?: "disputes" | "unmatched";
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin",              label: "Overview",           icon: DashboardCircleIcon },
  { href: "/admin/disputes",     label: "Disputes",           icon: AlertCircleIcon, countKey: "disputes" },
  { href: "/admin/unmatched",    label: "Unmatched payments", icon: RefreshIcon,     countKey: "unmatched" },
  { href: "/admin/transactions", label: "Transactions",       icon: Invoice04Icon },
  { href: "/admin/analytics",    label: "Analytics",          icon: ChartLineData02Icon },
  { href: "/admin/users",        label: "Users",              icon: UserGroupIcon },
];