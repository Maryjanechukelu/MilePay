"use client";
import { differenceInHours } from "date-fns";
import { useAdminDisputes } from "@/hooks/queries/useAdmin";

const REASON_LABELS: Record<string, string> = {
  work_not_delivered: "Work not delivered",
  poor_quality: "Poor quality",
  not_as_described: "Not as described",
  incomplete_delivery: "Incomplete delivery",
  other: "Other",
};

export default function AdminAnalyticsPage() {
  const { data: disputes, isLoading } = useAdminDisputes();

  if (isLoading) {
    return <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-40 rounded-xl" /></div>)}</div>;
  }

  const list = disputes ?? [];
  const byReason = list.reduce<Record<string, number>>((acc, d) => {
    acc[d.reason] = (acc[d.reason] ?? 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...Object.values(byReason));

  const avgAgeHours = list.length
    ? Math.round(list.reduce((sum, d) => sum + differenceInHours(new Date(), new Date(d.createdAt)), 0) / list.length)
    : 0;
  const respondedCount = list.filter((d) => !!d.providerResponse).length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-value">{list.length}</p>
          <p className="stat-label">Open disputes</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{avgAgeHours}h</p>
          <p className="stat-label">Average time open</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{list.length ? Math.round((respondedCount / list.length) * 100) : 0}%</p>
          <p className="stat-label">Provider response rate</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100">Disputes by reason</h3>
        {Object.keys(byReason).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No dispute data yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(byReason)
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => (
                <div key={reason}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{REASON_LABELS[reason] ?? reason}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Volume, revenue, and fee trends over time need a real time-series
          endpoint from the backend — nothing in adminApi currently supports
          "amount over time" queries, so those are intentionally left out
          rather than faked. */}
    </div>
  );
}