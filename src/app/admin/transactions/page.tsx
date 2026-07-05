"use client";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertTriangle, ChevronLeft, ChevronRight, InvoiceIcon } from "@hugeicons/core-free-icons";
import { formatNaira, formatDateTime, cn } from "@/lib/utils";
import { useAdminTransactions } from "@/hooks/queries/useAdmin";
// import { Hu } from "zod/v4/locales";

const STATE_TABS = ["ALL", "success", "pending", "failed"] as const;

export default function AdminTransactionsPage() {
  const [state, setState] = useState<(typeof STATE_TABS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminTransactions({
    page, limit: 20, state: state === "ALL" ? undefined : state,
  });

  return (
    <div>
      <div className="flex gap-1.5 mb-5">
        {STATE_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setState(s); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors",
              state === s ? "bg-forest-800 text-white border-forest-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <HugeiconsIcon icon={AlertTriangle} size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">Could not load transactions.</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm overflow-x-auto">
          <thead className="overflow-x-auto bg-slate-50 border-b border-slate-100">
            <tr className="border-b border-slate-100 text-left text-2xs font-semibold text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                </tr>
              ))
            ) : (data?.transactions ?? []).length === 0 ? (
              <tr className="">
                {/* <td colSpan={5}></td> */}
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No transactions found.</td>
              </tr>
            ) : (
              data!.transactions.map((t: any) => (
                <tr key={t.id ?? t.reference} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs">{t.reference ?? t.id}</td>
                  <td className="px-4 py-3 text-xs capitalize">{t.type ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge text-2xs",
                      t.status === "success" ? "badge-green" : t.status === "failed" ? "badge-red" : "badge-amber"
                    )}>
                      {t.status ?? "unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatNaira(t.amount ?? 0)}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-icon btn-ghost disabled:opacity-30"><HugeiconsIcon icon={ChevronLeft} size={16} /></button>
          <span className="text-xs text-slate-500">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="btn-icon btn-ghost disabled:opacity-30"><HugeiconsIcon icon={ChevronRight} size={16} /></button>
        </div>
      )}

      {/* Field names above are best-guesses (reference/type/status/amount/createdAt).
          Confirm the real shape of GET /admin/transactions and adjust the accessors. */}
    </div>
  );
}