"use client";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowRight, Clock, BarChart3 } from "lucide-react";
import { relativeTime, formatNaira } from "@/lib/utils";
import { useAdminDisputes, useAdminUnmatchedPayments } from "@/hooks/queries/useAdmin";

const REASON_LABELS: Record<string, string> = {
  work_not_delivered: "Work not delivered",
  poor_quality: "Poor quality",
  not_as_described: "Not as described",
  incomplete_delivery: "Incomplete delivery",
  other: "Other",
};

export default function AdminOverviewPage() {
  const { data: disputes, isLoading: loadingDisputes } = useAdminDisputes();
  const { data: unmatched, isLoading: loadingUnmatched } = useAdminUnmatchedPayments();

  const safeDisputes = Array.isArray(disputes) ? disputes : [];
  const safeUnmatched = Array.isArray(unmatched) ? unmatched : [];

  const sortedDisputes = [...safeDisputes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const totalUnmatchedValue = safeUnmatched.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Open disputes" value={disputes?.length ?? 0} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" loading={loadingDisputes} />
        <StatCard label="Unmatched payments" value={unmatched?.length ?? 0} icon={RefreshCw} color="text-amber-600" bg="bg-amber-50" loading={loadingUnmatched} />
        <StatCard label="Unmatched value" value={formatNaira(totalUnmatchedValue, { compact: true })} icon={RefreshCw} color="text-amber-600" bg="bg-amber-50" loading={loadingUnmatched} />
        {/* Active projects / platform fees have no supporting admin endpoint yet —
            wire these once the backend exposes project/fee aggregates. */}
        <StatCard label="Platform fees" value="—" icon={BarChart3} color="text-forest-600" bg="bg-forest-50" loading={false} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disputes preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Oldest open disputes</h3>
            <Link href="/admin/disputes" className="text-xs font-medium text-forest-700 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingDisputes ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : sortedDisputes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No open disputes 🎉</p>
          ) : (
            <div className="space-y-2">
              {sortedDisputes.slice(0, 4).map((d) => (
                <Link key={d.id} href="/admin/disputes" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 hover:border-red-200 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-red-800 truncate">Project {d.projectId.slice(-8)}</p>
                    <p className="text-2xs text-red-600">{REASON_LABELS[d.reason] ?? d.reason}</p>
                  </div>
                  <span className="text-2xs text-red-500 flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} /> {relativeTime(d.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Unmatched preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Recent unmatched payments</h3>
            <Link href="/admin/unmatched" className="text-xs font-medium text-forest-700 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingUnmatched ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : (unmatched ?? []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">All reconciled 🎉</p>
          ) : (
            <div className="space-y-2">
              {(unmatched ?? []).slice(0, 4).map((p) => (
                <Link key={p.id} href="/admin/unmatched" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100 hover:border-amber-200 transition-colors">
                  <p className="text-xs font-mono text-amber-800 truncate">{p.reference}</p>
                  <span className="text-xs font-bold text-amber-700">{formatNaira(p.amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics teaser */}
      <Link href="/admin/analytics" className="card p-5 flex items-center justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-forest-50 rounded-xl flex items-center justify-center">
            <BarChart3 size={16} className="text-forest-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">See dispute & payment trends</p>
            <p className="text-xs text-slate-400">Breakdown by reason, resolution time, and outcome</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-slate-400" />
      </Link>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, loading }: {
  label: string; value: string | number; icon: any; color: string; bg: string; loading: boolean;
}) {
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={16} className={color} />
      </div>
      <p className="stat-value">{loading ? "—" : value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}