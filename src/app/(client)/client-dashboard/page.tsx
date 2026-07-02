"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Shield, Clock, CheckCircle, AlertTriangle, ChevronRight,
  LogOut, Settings, Banknote, Package, Menu, X
} from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  formatNaira, relativeTime, PROJECT_STATE_CONFIG,
  getMilestoneProgress, getInitials, cn
} from "@/lib/utils";
import type { ClientDashboard, Project } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, DeliveryBox02Icon, InboxCheckIcon, Wallet02Icon, FolderClockIcon, DropboxIcon, } from "@hugeicons/core-free-icons";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dashboardApi.client()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);


  function handleLogout() {
    logout();
    router.push("/login");
  }

  const profile = user?.profile as { fullName?: string } | undefined;
  const displayName = profile?.fullName ?? user?.name ?? "Client";

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            {/* Mobile nav toggle */}
            <div className="sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-slate-200"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-2">
              <div className="w-full h-12 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
                <Image src="/bg-colored.png" alt="MilePay" width={120} height={50} loading="eager" />
              </div>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {[
              { href: "/client-dashboard", label: "My projects" },
              { href: "/settings", label: "Settings" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="btn-icon btn-ghost"><HugeiconsIcon icon={Notification01Icon} size={18} /></button>
            <Link href="/settings" className="btn-icon btn-ghost hidden sm:flex"><Settings size={18} /></Link>
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
            <button onClick={() => { logout(); router.push("/login"); }} className="btn-ghost btn-sm hidden sm:flex items-center gap-1.5">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
        {/* Mobile side drawer */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85%] bg-white shadow-xl border-r border-slate-100 transform transition-transform duration-300">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="font-semibold text-sm">
                  <Link href="/" className="sm:hidden items-center gap-2">
                    <div className="w-full h-10 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
                      <Image src="/logo-icon.png" alt="MilePay" width={40} height={32} loading="eager" />
                    </div>
                  </Link>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-md">
                  <X size={18} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {[
                  { href: "/client-dashboard", label: "My projects" },
                  { href: "/settings", label: "Settings" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-100">
                <Link href="/settings" className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Settings</Link>
                <button onClick={handleLogout} className="flex mt-3 w-full btn-primary">Sign out</button>
              </div>
            </aside>
          </>
        )}
      </header>

      <main className="container-wide py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Welcome, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your funded projects and pending approvals.</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton h-8 w-20 mb-2 rounded" />
                <div className="skeleton h-3 w-14 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active projects", value: data?.stats.activeProjects ?? 0, icon: (props: any) => <HugeiconsIcon icon={DeliveryBox02Icon} {...props} />, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending approvals", value: data?.stats.pendingApprovals ?? 0, icon: (props: any) => <HugeiconsIcon icon={FolderClockIcon} {...props} />, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Completed", value: data?.stats.completedProjects ?? 0, icon: (props: any) => <HugeiconsIcon icon={InboxCheckIcon} {...props} />, color: "text-forest-600", bg: "bg-forest-50" },
              { label: "Total invested", value: formatNaira(data?.stats.totalSpent ?? 0, { compact: true }), icon: (props: any) => <HugeiconsIcon icon={Wallet02Icon} {...props} />, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon size={24} className={s.color} />
                </div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pending approvals banner */}
        {!loading && (data?.stats.pendingApprovals ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">
                {data!.stats.pendingApprovals} milestone{data!.stats.pendingApprovals > 1 ? "s" : ""} waiting for your review
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                Review and approve delivered work to release payment to your provider.
                Auto-approves after 72 hours.
              </p>
            </div>
          </div>
        )}

        {/* Projects grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-900">Your projects</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-5">
                    <div className="skeleton h-5 w-48 mb-2 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                ))}
              </div>
            ) : !data?.projects.length ? (
              <ClientEmptyState />
            ) : (
              <div className="space-y-3">
                {data.projects.map((p) => (
                  <ClientProjectRow key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          {/* Protection info sidebar */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Shield size={15} className="text-forest-600" /> Your protection
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Funds held in Nomba virtual account - never sent to provider without your approval" },
                  { icon: CheckCircle, text: "You approve each milestone before payment releases" },
                  { icon: Clock, text: "72-hour review window - auto-approves if no action" },
                  { icon: AlertTriangle, text: "Dispute any milestone - funds frozen during review" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex gap-2.5">
                    <Icon size={13} className="text-forest-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-muted p-5">
              <p className="text-xs font-semibold text-forest-700 mb-1">MilePay is free for clients</p>
              <p className="text-xs text-forest-800 leading-relaxed">
                You pay nothing to use MilePay. The 2% platform fee is deducted from the service provider&apos;s payout only.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ClientProjectRow({ project }: { project: Project }) {
  const cfg = PROJECT_STATE_CONFIG[project.state];
  const progress = getMilestoneProgress(project.milestones);
  const pendingApprovals = project.milestones.filter(
    (m) => m.state === "SUBMITTED"
  ).length;

  return (
    <Link href={`/project/${project.id}/manage`} className="card-hover block p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{project.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {project.provider?.displayName ?? "Provider"} · {relativeTime(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${cfg.badgeClass} text-2xs`}>{cfg.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-2xs text-slate-400 mb-1">
          <span>{progress.completed}/{progress.total} milestones approved</span>
          <span className="font-medium text-slate-700">{formatNaira(project.totalAmount)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {pendingApprovals > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5">
          <Clock size={11} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-800">
            {pendingApprovals} milestone{pendingApprovals > 1 ? "s" : ""} ready to review
          </span>
        </div>
      )}
    </Link>
  );
}

function ClientEmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <HugeiconsIcon icon={DropboxIcon} size={28} className="text-forest-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
      <p className="text-slate-500 text-sm mb-2 max-w-xs mx-auto">
        When a service provider shares a MilePay project link with you, it will appear here after you accept it.
      </p>
      <p className="text-xs text-slate-400">Ask your provider to send you a MilePay project link.</p>
    </div>
  );
}
