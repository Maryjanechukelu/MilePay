"use client";
import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertTriangle, RefreshCw, CheckCircle, ShieldCheck } from "@hugeicons/core-free-icons";
import { adminApi } from "@/lib/api";
import { formatNaira, formatDateTime, relativeTime } from "@/lib/utils";
import { useAdminUnmatchedPayments, useAdminActions } from "@/hooks/queries/useAdmin";

export default function AdminUnmatchedPage() {
  const { data: payments, isLoading } = useAdminUnmatchedPayments();
  const { invalidateUnmatched } = useAdminActions();
  const [resolving, setResolving] = useState<string | null>(null);

  async function handleResolve(id: string, action: "match" | "return") {
    setResolving(id);
    try {
      await adminApi.resolveUnmatched(id, action);
      toast.success(action === "return" ? "Payment returned to sender" : "Payment matched to project");
      invalidateUnmatched();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resolve payment");
    } finally {
      setResolving(null);
    }
  }

  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-16 rounded-xl" /></div>)}</div>;
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="card p-12 text-center">
        <HugeiconsIcon icon={ShieldCheck} size={32} className="text-forest-400 mx-auto mb-3" />
        <p className="font-semibold text-slate-700">No unmatched payments</p>
        <p className="text-sm text-slate-400 mt-1">All inbound transfers have been reconciled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div key={p.id} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={AlertTriangle} size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Unmatched inbound transfer</p>
                <p className="text-xs text-slate-500 mt-0.5">Ref: <span className="font-mono">{p.reference}</span> · {relativeTime(p.createdAt)}</p>
                {p.narration && <p className="text-xs text-slate-400 mt-0.5">Narration: {p.narration}</p>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display font-bold text-amber-700 text-lg tabular-nums">{formatNaira(p.amount)}</p>
              <p className="text-2xs text-slate-400">{formatDateTime(p.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleResolve(p.id, "return")} disabled={resolving === p.id} className="btn-outline btn-sm flex-1 justify-center gap-1.5 disabled:opacity-40">
              {resolving === p.id ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <HugeiconsIcon icon={RefreshCw} size={12} />} Return to sender
            </button>
            <button onClick={() => handleResolve(p.id, "match")} disabled={resolving === p.id} className="btn-primary btn-sm flex-1 justify-center gap-1.5 disabled:opacity-40">
              {resolving === p.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HugeiconsIcon icon={CheckCircle} size={12} />} Match to project
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}