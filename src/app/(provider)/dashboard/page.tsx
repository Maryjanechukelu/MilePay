"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, TrendingUp, Briefcase, CheckCircle, Clock, ArrowRight,
  LogOut, Bell, Settings, ChevronRight, Banknote, AlertTriangle
} from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  formatNaira, relativeTime, PROJECT_STATE_CONFIG,
  MILESTONE_STATE_CONFIG, getMilestoneProgress, getInitials, cn
} from "@/lib/utils";
import type { ProviderDashboard, Project } from "@/types";

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState<ProviderDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.provider()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const profile = user?.profile as { displayName?: string } | undefined;
  const displayName = profile?.displayName ?? user?.name ?? "Provider";

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-forest-900 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
              </div>
              <span className="font-display font-bold text-forest-900">MilePay</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/projects/new", label: "New project" },
                { href: "/earnings", label: "Earnings" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon btn-ghost relative">
              <Bell size={18} />
            </button>
            <Link href="/settings" className="btn-icon btn-ghost"><Settings size={18} /></Link>
            <div className="w-8 h-8 bg-forest-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
            <button onClick={handleLogout} className="btn-ghost btn-sm hidden sm:flex items-center gap-1.5">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Good day, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what&apos;s happening with your projects.</p>
          </div>
          <Link href="/projects/new" className="btn-primary gap-2">
            <Plus size={16} /> New project
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card"><div className="skeleton h-8 w-24 mb-2 rounded" /><div className="skeleton h-3 w-16 rounded" /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active projects",  value: data?.stats.activeProjects ?? 0,           icon: Briefcase,  color: "text-blue-600",    bg: "bg-blue-50" },
              { label: "Completed",        value: data?.stats.completedProjects ?? 0,         icon: CheckCircle,color: "text-forest-600",  bg: "bg-forest-50" },
              { label: "Total earned",     value: formatNaira(data?.stats.totalEarned ?? 0, { compact: true }), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Pending payout",   value: formatNaira(data?.stats.pendingAmount ?? 0, { compact: true }), icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-900">Your projects</h2>
              <Link href="/projects" className="text-sm text-forest-700 font-medium hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-5"><div className="skeleton h-5 w-48 mb-2 rounded" /><div className="skeleton h-3 w-32 rounded" /></div>
                ))}
              </div>
            ) : !data?.projects.length ? (
              <EmptyProjects />
            ) : (
              <div className="space-y-3">
                {data.projects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Action needed */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" /> Action needed
              </h3>
              {loading ? (
                <div className="skeleton h-16 rounded-xl" />
              ) : (
                <div className="space-y-3">
                  {data?.projects
                    .flatMap((p) =>
                      p.milestones
                        .filter((m) => m.state === "REVISION_REQUESTED")
                        .map((m) => ({ project: p, milestone: m }))
                    )
                    .slice(0, 3)
                    .map(({ project, milestone }) => (
                      <Link
                        key={milestone.id}
                        href={`/projects/${project.id}`}
                        className="block bg-amber-50 border border-amber-200 rounded-xl p-3 hover:border-amber-300 transition-colors"
                      >
                        <p className="text-xs font-semibold text-amber-800 truncate">{milestone.title}</p>
                        <p className="text-xs text-amber-600 mt-0.5">{project.title} — revision requested</p>
                      </Link>
                    )) ?? []}
                  {(data?.projects.flatMap((p) =>
                    p.milestones.filter((m) => m.state === "REVISION_REQUESTED")
                  ).length ?? 0) === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">No pending actions 🎉</p>
                  )}
                </div>
              )}
            </div>

            {/* Recent payouts */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Banknote size={15} className="text-forest-600" /> Recent payouts
              </h3>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
                </div>
              ) : (data?.recentPayments ?? []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No payouts yet</p>
              ) : (
                <div className="space-y-2.5">
                  {data!.recentPayments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-800">{p.narration ?? "Milestone payout"}</p>
                        <p className="text-2xs text-slate-400">{relativeTime(p.createdAt)}</p>
                      </div>
                      <span className="text-xs font-bold text-forest-700 tabular-nums">
                        +{formatNaira(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const cfg = PROJECT_STATE_CONFIG[project.state];
  const progress = getMilestoneProgress(project.milestones);
  const nextMilestone = project.milestones.find(
    (m) => m.state === "SUBMITTED" || m.state === "IN_PROGRESS"
  );

  return (
    <Link href={`/projects/${project.id}`} className="card-hover block p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{project.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {project.client ? `Client: ${project.client.fullName}` : "No client yet"} · {relativeTime(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${cfg.badgeClass} text-2xs`}>{cfg.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-2xs text-slate-400 mb-1">
          <span>{progress.completed}/{progress.total} milestones</span>
          <span className="font-medium text-forest-700">{formatNaira(project.totalAmount)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {nextMilestone && (
        <div className={cn("text-xs rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5",
          MILESTONE_STATE_CONFIG[nextMilestone.state].badgeClass
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          {nextMilestone.title} — {MILESTONE_STATE_CONFIG[nextMilestone.state].label}
        </div>
      )}
    </Link>
  );
}

function EmptyProjects() {
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Briefcase size={24} className="text-forest-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
      <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
        Create your first project, set milestones, and share the link with your client.
      </p>
      <Link href="/projects/new" className="btn-primary gap-2 inline-flex">
        <Plus size={15} /> Create first project
      </Link>
    </div>
  );
}
