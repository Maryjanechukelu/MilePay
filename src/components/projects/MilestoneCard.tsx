"use client";
import { CheckCircle, Clock, ArrowRight, Lock, AlertTriangle, RefreshCw } from "lucide-react";
import {
  formatNaira, relativeTime, MILESTONE_STATE_CONFIG,
  calculateFee, hoursUntil, cn
} from "@/lib/utils";
import type { Milestone } from "@/types";

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  /** Show the provider's net amount (after fee) instead of the gross milestone amount */
  showProviderEarnings?: boolean;
  /** Render action buttons below the card. Pass null/undefined to render a read-only card. */
  actions?: React.ReactNode;
  /** Extra content such as delivery notes or revision notes, rendered above actions */
  children?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Reusable milestone summary card. Used in project detail/manage pages,
 * dashboards, and anywhere a single milestone needs to be displayed
 * consistently with state-aware styling.
 */
export function MilestoneCard({
  milestone: m,
  index,
  showProviderEarnings = false,
  actions,
  children,
  onClick,
}: MilestoneCardProps) {
  const stateCfg = MILESTONE_STATE_CONFIG[m.state];
  const { providerReceives } = calculateFee(m.amount);
  const autoApproveIn = m.autoApproveAt ? hoursUntil(m.autoApproveAt) : null;
  const isLocked = m.state === "LOCKED";

  const stateIcon = () => {
    switch (m.state) {
      case "PAID":      return <CheckCircle size={14} className="text-white" />;
      case "SUBMITTED": return <Clock size={14} className="text-white" />;
      case "IN_PROGRESS": return <ArrowRight size={14} className="text-white" />;
      case "LOCKED":    return <Lock size={12} className="text-slate-400" />;
      case "DISPUTED":  return <AlertTriangle size={13} className="text-white" />;
      case "APPROVED_PENDING_TRANSFER": return <RefreshCw size={13} className="text-white animate-spin" />;
      default: return <span className="text-xs font-bold text-slate-500">{index + 1}</span>;
    }
  };

  const dotColor = () => {
    switch (m.state) {
      case "PAID":      return "bg-forest-600";
      case "SUBMITTED": return "bg-amber-500";
      case "IN_PROGRESS": return "bg-blue-500";
      case "DISPUTED":  return "bg-red-500";
      case "APPROVED_PENDING_TRANSFER": return "bg-amber-500";
      default: return "bg-slate-200";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-2xl p-4 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-sm",
        isLocked ? "border-slate-100 bg-slate-50/50 opacity-60" :
        m.state === "SUBMITTED" ? "border-amber-200 bg-amber-50/40" :
        m.state === "PAID" ? "border-forest-200 bg-forest-50/30" :
        m.state === "DISPUTED" ? "border-red-200 bg-red-50/30" :
        "border-slate-200 bg-white"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", dotColor())}>
            {stateIcon()}
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold text-sm", isLocked ? "text-slate-400" : "text-slate-900")}>
              {m.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-extrabold text-slate-900 tabular-nums">
            {formatNaira(m.amount)}
          </p>
          {showProviderEarnings && m.state !== "LOCKED" && (
            <p className="text-2xs text-slate-400 tabular-nums">
              You get {formatNaira(providerReceives)}
            </p>
          )}
        </div>
      </div>

      {/* Deliverable */}
      <div className="flex items-start gap-2 mb-3">
        <CheckCircle size={12} className="text-forest-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Deliverable:</span> {m.deliverable}
        </p>
      </div>

      {/* Badge row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`badge text-2xs ${stateCfg.badgeClass}`}>{stateCfg.label}</span>

        {m.state === "SUBMITTED" && autoApproveIn !== null && autoApproveIn > 0 && (
          <p className="text-2xs text-amber-600 flex items-center gap-1">
            <Clock size={10} /> Auto-approves in ~{autoApproveIn}h
          </p>
        )}
        {m.state === "PAID" && m.paidAt && (
          <p className="text-2xs text-slate-400">Paid {relativeTime(m.paidAt)}</p>
        )}
      </div>

      {/* Slot for delivery notes / revision notes */}
      {children}

      {/* Slot for action buttons */}
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
