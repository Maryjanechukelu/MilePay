"use client";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind text colour class for the icon, e.g. "text-forest-600" */
  iconColor?: string;
  /** Tailwind background colour class for the icon container, e.g. "bg-forest-50" */
  iconBg?: string;
  /** Optional small text shown beneath the value, e.g. "All time" */
  sublabel?: string;
  loading?: boolean;
}

/**
 * Reusable stat card used across provider, client, and admin dashboards.
 * Renders a skeleton shimmer state when `loading` is true.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-forest-600",
  iconBg = "bg-forest-50",
  sublabel,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton w-9 h-9 rounded-xl mb-3" />
        <div className="skeleton h-7 w-20 mb-2 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>
        <Icon size={16} className={iconColor} />
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {sublabel && <p className="text-2xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
