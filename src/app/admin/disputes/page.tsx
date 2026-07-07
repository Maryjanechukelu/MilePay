"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckCircle, Banknote, RefreshCw, X, FileText, Clock, Banknote as BanknoteIcon } from "@hugeicons/core-free-icons";
import { adminApi } from "@/lib/api";
import { relativeTime, cn } from "@/lib/utils";
import type { MilestoneDispute } from "@/types";
import { useAdminDisputes, useAdminActions } from "@/hooks/queries/useAdmin";

const REASON_LABELS: Record<string, string> = {
  work_not_delivered: "Work not delivered",
  poor_quality: "Poor quality",
  not_as_described: "Not as described",
  incomplete_delivery: "Incomplete delivery",
  other: "Other",
};

export default function AdminDisputesPage() {
  const { data: disputes, isLoading } = useAdminDisputes();
  const { invalidateDisputes } = useAdminActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const sorted = useMemo(
    () => [...(disputes ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [disputes]
  );
  const selected = sorted.find((d) => d.id === selectedId) ?? null;

  // useEffect(() => {
  //   if (!selectedId && sorted.length) {
  //     setSelectedId(sorted[0].id);
  //   }
  // }, [sorted, selectedId]);

  async function handleResolve(id: string, outcome: "release" | "refund") {
    if (!notes) { toast.error("Add resolution notes"); return; }
    setResolving(id + outcome);
    try {
      await adminApi.resolveDispute(id, outcome, notes);
      toast.success(outcome === "release" ? "Funds released to provider" : "Refund issued to client");
      setNotes("");
      setSelectedId(null);
      invalidateDisputes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resolve dispute");
    } finally {
      setResolving(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-20 rounded-xl" /></div>)}</div>
        <div className="card p-5 hidden lg:block"><div className="skeleton h-64 rounded-xl" /></div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="card p-12 text-center">
        <HugeiconsIcon icon={CheckCircle} size={32} className="text-forest-400 mx-auto mb-3" />
        <p className="font-semibold text-slate-700">No open disputes</p>
        <p className="text-sm text-slate-400 mt-1">All disputes have been resolved.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-5 items-start">
      <div className="space-y-2.5">
        {sorted.map((d) => (
          <button
            key={d.id}
            onClick={() => { setSelectedId(d.id); setNotes(""); }}
            className={cn(
              "w-full text-left card p-4 transition-all",
              selectedId === d.id ? "border-forest-400 shadow-sm ring-1 ring-forest-200" : "hover:border-slate-300"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-slate-900 text-sm truncate">Project {d.projectId.slice(-8)}</p>
              <span className="text-2xs text-slate-400 flex-shrink-0 whitespace-nowrap">{relativeTime(d.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{REASON_LABELS[d.reason] ?? d.reason}</p>
            {d.providerResponse ? (
              <span className="badge badge-blue text-2xs">Provider replied</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-500 border-slate-200 text-2xs flex items-center gap-1 w-fit">
                <HugeiconsIcon icon={Clock} size={10} /> Awaiting provider
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="lg:sticky lg:top-20">
        {selected ? (
          <div className="card overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-red">Disputed</span>
                  <span className="text-xs text-slate-400">Opened {relativeTime(selected.createdAt)}</span>
                </div>
                <p className="font-semibold text-slate-900 text-sm">Project {selected.projectId.slice(-8)}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reason: <span className="font-medium text-slate-700">{REASON_LABELS[selected.reason] ?? selected.reason}</span>
                </p>
              </div>
              <button onClick={() => setSelectedId(null)} className="btn-icon btn-ghost flex-shrink-0" aria-label="Close">
                <HugeiconsIcon icon={X} size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                  <p className="text-2xs font-semibold text-red-700 mb-1.5">Client&apos;s account</p>
                  <p className="text-xs text-red-800 leading-relaxed">{selected.description}</p>
                </div>
                {selected.providerResponse ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                    <p className="text-2xs font-semibold text-blue-700 mb-1.5">Provider&apos;s response</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{selected.providerResponse}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2">
                    <HugeiconsIcon icon={Clock} size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">No response from the provider yet. You can still resolve, or wait for their reply.</p>
                  </div>
                )}
              </div>

              {(selected.clientEvidence.length > 0 || (selected.providerEvidence?.length ?? 0) > 0) && (
                <div>
                  <p className="text-2xs font-semibold text-slate-500 mb-2">Evidence</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.clientEvidence.map((f: any) => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="text-2xs text-blue-600 hover:underline bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">📎 {f.name}</a>
                    ))}
                    {selected.providerEvidence?.map((f: any) => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="text-2xs text-forest-600 hover:underline bg-forest-50 border border-forest-200 rounded-lg px-2 py-1">📎 {f.name}</a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <label className="field-label text-xs">Resolution notes (required)</label>
                <textarea
                  className="field-textarea text-sm"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain your decision — both parties will receive this note…"
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button onClick={() => handleResolve(selected.id, "release")} disabled={!!resolving || !notes} className="btn-primary justify-center gap-2 disabled:opacity-40">
                    {resolving === selected.id + "release" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HugeiconsIcon icon={Banknote} size={14} />}
                    Release to provider
                  </button>
                  <button onClick={() => handleResolve(selected.id, "refund")} disabled={!!resolving || !notes} className="btn-danger justify-center gap-2 disabled:opacity-40">
                    {resolving === selected.id + "refund" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HugeiconsIcon icon={RefreshCw} size={14} />}
                    Refund client
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed">
            <HugeiconsIcon icon={FileText} size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 text-sm">Select a dispute to review</p>
            <p className="text-xs text-slate-400 mt-1">Oldest cases are listed first — {sorted.length} waiting.</p>
          </div>
        )}
      </div>
    </div>
  );
}