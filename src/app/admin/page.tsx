"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, RefreshCw, Shield, Banknote,
  Package, Users, TrendingUp, ChevronLeft, X, FileText, Clock
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { formatNaira, formatDateTime, relativeTime, cn } from "@/lib/utils";
import type { AdminDashboard, MilestoneDispute, Payment } from "@/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"disputes" | "unmatched" | "transactions">("disputes");
  const [resolving, setResolving] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<MilestoneDispute | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  async function loadData() {
    try {
      const [disputesRes, unmatchedRes] = await Promise.all([
        adminApi.getDisputes(),
        adminApi.getUnmatchedPayments(),
      ]);
      setData({
        stats: { totalProjects: 0, activeProjects: 0, openDisputes: disputesRes.data.data?.length ?? 0, unmatchedPayments: unmatchedRes.data.data?.length ?? 0, totalVolume: 0, totalFees: 0 },
        disputes: disputesRes.data.data ?? [],
        unmatchedPayments: unmatchedRes.data.data ?? [],
      });
    } catch {
      toast.error("Could not load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleResolve(disputeId: string, outcome: "release" | "refund") {
    if (!resolveNotes) { toast.error("Add resolution notes"); return; }
    setResolving(disputeId + outcome);
    try {
      await adminApi.resolveDispute(disputeId, outcome, resolveNotes);
      toast.success(outcome === "release" ? "Funds released to provider" : "Refund issued to client");
      setSelectedDispute(null);
      setResolveNotes("");
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not resolve dispute");
    } finally {
      setResolving(null);
    }
  }

  async function handleResolveUnmatched(paymentId: string, action: "match" | "return") {
    setResolving(paymentId);
    try {
      await adminApi.resolveUnmatched(paymentId, action);
      toast.success(action === "return" ? "Payment returned to sender" : "Payment matched to project");
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not resolve payment");
    } finally {
      setResolving(null);
    }
  }

  const tabs = [
    { id: "disputes" as const,     label: "Disputes",           count: data?.stats.openDisputes ?? 0 },
    { id: "unmatched" as const,    label: "Unmatched Payments", count: data?.stats.unmatchedPayments ?? 0 },
    { id: "transactions" as const, label: "Transactions",       count: null },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest-950 border-b border-forest-800 sticky top-0 z-30">
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-forest-700 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
              </div>
              <span className="font-display font-bold text-white">MilePay</span>
            </Link>
            <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/30 text-2xs">Admin</span>
          </div>
          <Link href="/" className="btn-ghost btn-sm text-slate-400 gap-1.5">
            <ChevronLeft size={14} /> Exit admin
          </Link>
        </div>
      </header>

      <div className="container-wide py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Open disputes",       value: data?.stats.openDisputes ?? 0,       icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50" },
            { label: "Unmatched payments",  value: data?.stats.unmatchedPayments ?? 0,  icon: RefreshCw,     color: "text-amber-600",  bg: "bg-amber-50" },
            { label: "Active projects",     value: data?.stats.activeProjects ?? 0,     icon: Package,       color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Platform fees",       value: formatNaira(data?.stats.totalFees ?? 0, { compact: true }), icon: TrendingUp, color: "text-forest-600", bg: "bg-forest-50" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="stat-value">{loading ? "—" : s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === t.id
                  ? "border-forest-600 text-forest-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === t.id ? "bg-forest-100 text-forest-700" : "bg-slate-100 text-slate-600"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Disputes tab */}
        {activeTab === "disputes" && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-24 rounded-xl" /></div>)}
              </div>
            ) : (data?.disputes ?? []).length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={32} className="text-forest-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">No open disputes</p>
                <p className="text-sm text-slate-400 mt-1">All disputes have been resolved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data!.disputes.map((d) => (
                  <DisputeCard
                    key={d.id}
                    dispute={d}
                    onSelect={() => setSelectedDispute(d)}
                    isSelected={selectedDispute?.id === d.id}
                    resolveNotes={resolveNotes}
                    setResolveNotes={setResolveNotes}
                    onResolve={handleResolve}
                    resolving={resolving}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unmatched payments tab */}
        {activeTab === "unmatched" && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-16 rounded-xl" /></div>)}
              </div>
            ) : (data?.unmatchedPayments ?? []).length === 0 ? (
              <div className="card p-12 text-center">
                <Shield size={32} className="text-forest-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">No unmatched payments</p>
                <p className="text-sm text-slate-400 mt-1">All inbound transfers have been reconciled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data!.unmatchedPayments.map((p) => (
                  <UnmatchedPaymentRow
                    key={p.id}
                    payment={p}
                    onResolve={handleResolveUnmatched}
                    resolving={resolving === p.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions tab */}
        {activeTab === "transactions" && (
          <div className="card p-8 text-center text-slate-400 text-sm">
            Full transaction monitor coming soon. Use the API endpoint GET /admin/transactions for now.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dispute Card ─────────────────────────────────────────────────
function DisputeCard({
  dispute,
  onSelect,
  isSelected,
  resolveNotes,
  setResolveNotes,
  onResolve,
  resolving,
}: {
  dispute: MilestoneDispute;
  onSelect: () => void;
  isSelected: boolean;
  resolveNotes: string;
  setResolveNotes: (v: string) => void;
  onResolve: (id: string, outcome: "release" | "refund") => void;
  resolving: string | null;
}) {
  const REASON_LABELS: Record<string, string> = {
    work_not_delivered:  "Work not delivered",
    poor_quality:        "Poor quality",
    not_as_described:    "Not as described",
    incomplete_delivery: "Incomplete delivery",
    other:               "Other",
  };

  return (
    <div className={cn("card overflow-hidden transition-all", isSelected && "border-forest-300 shadow-md")}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-red">Disputed</span>
              <span className="text-xs text-slate-400">{relativeTime(dispute.createdAt)}</span>
            </div>
            <p className="font-semibold text-slate-900 text-sm">
              Dispute on milestone — Project {dispute.projectId.slice(-8)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Reason: <span className="font-medium text-slate-700">{REASON_LABELS[dispute.reason] ?? dispute.reason}</span>
            </p>
          </div>
          <button onClick={onSelect} className="btn-ghost btn-sm gap-1.5 flex-shrink-0">
            <FileText size={13} /> Review
          </button>
        </div>

        {/* Client description */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
          <p className="text-2xs font-semibold text-red-700 mb-1">Client&apos;s account</p>
          <p className="text-xs text-red-800 leading-relaxed">{dispute.description}</p>
        </div>

        {/* Provider response */}
        {dispute.providerResponse ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
            <p className="text-2xs font-semibold text-blue-700 mb-1">Provider&apos;s response</p>
            <p className="text-xs text-blue-800 leading-relaxed">{dispute.providerResponse}</p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock size={11} /> Provider has not submitted a response yet
            </p>
          </div>
        )}

        {/* Evidence files */}
        {(dispute.clientEvidence.length > 0 || (dispute.providerEvidence?.length ?? 0) > 0) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {dispute.clientEvidence.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                className="text-2xs text-blue-600 hover:underline bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                📎 {f.name}
              </a>
            ))}
            {dispute.providerEvidence?.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                className="text-2xs text-forest-600 hover:underline bg-forest-50 border border-forest-200 rounded-lg px-2 py-1">
                📎 {f.name}
              </a>
            ))}
          </div>
        )}

        {/* Resolve actions */}
        {isSelected && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div>
              <label className="field-label text-xs">Resolution notes (required)</label>
              <textarea
                className="field-textarea text-sm"
                rows={3}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Explain your decision — both parties will receive this note…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onResolve(dispute.id, "release")}
                disabled={!!resolving || !resolveNotes}
                className="btn-primary justify-center gap-2 disabled:opacity-40"
              >
                {resolving === dispute.id + "release" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Banknote size={14} />}
                Release to provider
              </button>
              <button
                onClick={() => onResolve(dispute.id, "refund")}
                disabled={!!resolving || !resolveNotes}
                className="btn-danger justify-center gap-2 disabled:opacity-40"
              >
                {resolving === dispute.id + "refund" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <RefreshCw size={14} />}
                Refund client
              </button>
            </div>
            <button onClick={() => {}} className="btn-ghost w-full justify-center text-xs text-slate-400">
              <X size={12} className="mr-1" /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Unmatched Payment Row ────────────────────────────────────────
function UnmatchedPaymentRow({
  payment,
  onResolve,
  resolving,
}: {
  payment: Payment;
  onResolve: (id: string, action: "match" | "return") => void;
  resolving: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Unmatched inbound transfer</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref: <span className="font-mono">{payment.reference}</span> · {relativeTime(payment.createdAt)}
            </p>
            {payment.narration && (
              <p className="text-xs text-slate-400 mt-0.5">Narration: {payment.narration}</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-amber-700 text-lg tabular-nums">
            {formatNaira(payment.amount)}
          </p>
          <p className="text-2xs text-slate-400">{formatDateTime(payment.createdAt)}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onResolve(payment.id, "return")}
          disabled={resolving}
          className="btn-outline btn-sm flex-1 justify-center gap-1.5 disabled:opacity-40"
        >
          {resolving ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <RefreshCw size={12} />}
          Return to sender
        </button>
        <button
          onClick={() => onResolve(payment.id, "match")}
          disabled={resolving}
          className="btn-primary btn-sm flex-1 justify-center gap-1.5 disabled:opacity-40"
        >
          {resolving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={12} />}
          Match to project
        </button>
      </div>
    </div>
  );
}
