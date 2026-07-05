"use client";
import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckCircle, BanIcon, UserCheck } from "@hugeicons/core-free-icons";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAdminUsers, useAdminActions } from "@/hooks/queries/useAdmin";

const ROLE_TABS = ["ALL", "provider", "client"] as const;

export default function AdminUsersPage() {
  const [role, setRole] = useState<(typeof ROLE_TABS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers({ role: role === "ALL" ? undefined : role, page });
  const { invalidateUsers } = useAdminActions();
  const [busy, setBusy] = useState<string | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function handleVerify(id: string) {
    setBusy(id);
    try {
      await adminApi.verifyUser(id);
      toast.success("User verified");
      invalidateUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify user");
    } finally {
      setBusy(null);
    }
  }

  async function handleSuspend(id: string) {
    if (!reason) { toast.error("Add a reason for suspension"); return; }
    setBusy(id);
    try {
      await adminApi.suspendUser(id, reason);
      toast.success("User suspended");
      setSuspendingId(null);
      setReason("");
      invalidateUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not suspend user");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-5">
        {ROLE_TABS.map((r) => (
          <button
            key={r}
            onClick={() => { setRole(r); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors",
              role === r ? "bg-forest-800 text-white border-forest-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            {r === "ALL" ? "All" : r}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-10 rounded" /></div>)}</div>
      ) : (data?.users ?? []).length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">No users found.</div>
      ) : (
        <div className="space-y-2.5">
          {data!.users.map((u: any) => (
            <div key={u.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{u.name ?? u.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{u.email} · <span className="capitalize">{u.role}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!u.verified && (
                    <button onClick={() => handleVerify(u.id)} disabled={busy === u.id} className="btn-outline btn-sm gap-1.5 disabled:opacity-40">
                      <HugeiconsIcon icon={UserCheck} size={12} /> Verify
                    </button>
                  )}
                  {!u.suspended && (
                    <button onClick={() => setSuspendingId(suspendingId === u.id ? null : u.id)} className="btn-outline btn-sm gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                      <HugeiconsIcon icon={BanIcon} size={12} /> Suspend
                    </button>
                  )}
                  {u.suspended && <span className="badge badge-red text-2xs">Suspended</span>}
                </div>
              </div>

              {suspendingId === u.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for suspension…"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                  <button onClick={() => handleSuspend(u.id)} disabled={busy === u.id || !reason} className="btn-danger btn-sm disabled:opacity-40">
                    {busy === u.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Field names (name/email/role/verified/suspended) are best-guesses —
          confirm against the real GET /admin/users response shape. */}
    </div>
  );
}