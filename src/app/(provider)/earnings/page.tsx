"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Triangle02Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Clock03Icon,
  Logout01Icon,
  Menu01Icon,
  PlusSignIcon,
  Settings01Icon,
  Chart01Icon,
  Wallet02Icon,
  Cancel01Icon,
  Money02Icon,
} from "@hugeicons/core-free-icons";

import { useAuthStore } from "@/store/authStore";
import { useProviderDashboard } from "@/hooks/queries";
import { formatNaira, getGreeting, getInitials, relativeTime, cn } from "@/lib/utils";

export default function ProviderEarningsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useProviderDashboard();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const profile = user?.profile as { displayName?: string } | undefined;
  const displayName = profile?.displayName ?? user?.name ?? "Provider";

  const paidMilestones = (data?.projects ?? []).flatMap((project) =>
    (project.milestones ?? []).filter((milestone) => milestone.state === "PAID")
      .map((milestone) => ({ project, milestone }))
  );

  const pendingMilestones = (data?.projects ?? []).flatMap((project) =>
    (project.milestones ?? []).filter(
      (milestone) => milestone.state === "APPROVED" || milestone.state === "APPROVED_PENDING_TRANSFER"
    ).map((milestone) => ({ project, milestone }))
  );

  const totalEarned = paidMilestones.reduce((sum, entry) => sum + entry.milestone.amount, 0);
  const pendingAmount = pendingMilestones.reduce((sum, entry) => sum + entry.milestone.amount, 0);
  const releasedCount = paidMilestones.length;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-slate-200"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <HugeiconsIcon icon={Cancel01Icon} size={18} /> : <HugeiconsIcon icon={Menu01Icon} size={18} />}
              </button>
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-2">
                <div className="w-full h-12 flex items-center justify-center shadow-sm">
                <Image src="/logo-main.jpg" alt="MilePay" width={120} height={50} style={{ width: "auto", height: "auto" }} />
              </div>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/projects/new", label: "New project" },
              { href: "/earnings", label: "Earnings" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  link.href === "/earnings"
                    ? "bg-forest-50 text-forest-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/settings" className="btn-icon btn-ghost hidden sm:flex">
              <HugeiconsIcon icon={Settings01Icon} size={18} />
            </Link>
            <div className="w-8 h-8 bg-forest-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
            <button onClick={handleLogout} className="btn-ghost btn-sm hidden sm:flex items-center gap-1.5">
              <HugeiconsIcon icon={Logout01Icon} size={14} /> Sign out
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} aria-hidden />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85%] bg-white shadow-xl border-r border-slate-100">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <div className="w-10 h-10 bg-forest-900 rounded-lg flex items-center justify-center">
                    <Image src="/logo-icon.png" alt="MilePay" width={32} height={24} />
                  </div>
                </Link>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-md">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/projects/new", label: "New project" },
                  { href: "/earnings", label: "Earnings" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-100">
                <Link href="/settings" className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                  Settings
                </Link>
                <button onClick={handleLogout} className="flex mt-3 w-full btn-primary">
                  Sign out
                </button>
              </div>
            </aside>
          </>
        )}
      </header>

      <main className="container-wide py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {getGreeting()}, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Track your earnings, upcoming payouts, and completed milestones.</p>
          </div>
          <Link href="/projects/new" className="btn-primary gap-2 text-sm whitespace-nowrap">
            <HugeiconsIcon icon={PlusSignIcon} size={16} /> New project
          </Link>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <HugeiconsIcon icon={Triangle02Icon} size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Could not load your earnings data. Check your connection and
              <button onClick={() => void refetch()} className="font-semibold underline ml-1">
                try again
              </button>.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total earned",
              value: isLoading ? "—" : formatNaira(totalEarned, { compact: true }),
              icon: Wallet02Icon,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Pending payout",
              value: isLoading ? "—" : formatNaira(pendingAmount, { compact: true }),
              icon: Clock03Icon,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Released milestones",
              value: isLoading ? "—" : releasedCount.toString(),
              icon: Money02Icon,
              color: "text-forest-600",
              bg: "bg-forest-50",
            },
            {
              label: "Projects with payouts",
              value: isLoading ? "—" : new Set(paidMilestones.map((entry) => entry.project.id)).size.toString(),
              icon: Chart01Icon,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-5">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <HugeiconsIcon icon={Icon} size={20} className={item.color} />
                </div>
                <p className="font-display text-2xl font-extrabold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500 mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid xl:grid-cols-[1.3fr_0.9fr] gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">Recent payouts</h2>
                  <p className="text-sm text-slate-500">Milestones that have already been released to you.</p>
                </div>
                <Link href="/projects" className="text-sm text-forest-700 font-medium hover:underline">
                  View projects
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
              ) : paidMilestones.length === 0 ? (
                <EmptyState title="No payouts yet" description="Your completed milestone payouts will appear here." />
              ) : (
                <div className="space-y-3">
                  {paidMilestones.slice(0, 8).map(({ project, milestone }) => (
                    <div key={milestone.id} className="border border-slate-100 rounded-2xl p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{milestone.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{project.title}</p>
                        <div className="flex items-center gap-2 mt-2 text-2xs text-slate-400">
                          <HugeiconsIcon icon={Calendar03Icon} size={12} />
                          <span>{milestone.paidAt ? relativeTime(milestone.paidAt) : "Recently released"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-extrabold text-forest-700 text-lg tabular-nums">
                          {formatNaira(milestone.amount)}
                        </p>
                        <span className="inline-flex mt-2 text-2xs px-2.5 py-1 rounded-full bg-forest-50 text-forest-700">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">Pending release</h2>
                  <p className="text-sm text-slate-500">Milestones approved and waiting to be transferred.</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-xl" />
                  ))}
                </div>
              ) : pendingMilestones.length === 0 ? (
                <EmptyState title="Nothing pending" description="Approved milestones will appear here once they’re ready to release." />
              ) : (
                <div className="space-y-3">
                  {pendingMilestones.slice(0, 6).map(({ project, milestone }) => (
                    <div key={milestone.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{milestone.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{project.title}</p>
                        </div>
                        <p className="font-display font-extrabold text-amber-700 text-base tabular-nums">
                          {formatNaira(milestone.amount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-2xs text-amber-700">
                        <span className="inline-flex items-center gap-1.5">
                          <HugeiconsIcon icon={Clock03Icon} size={12} /> {milestone.state === "APPROVED_PENDING_TRANSFER" ? "Pending transfer" : "Approved"}
                        </span>
                        <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 font-semibold hover:underline">
                          Review <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-3">How earnings work</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800 mb-1">Milestones must be approved</p>
                  <p>Once a client approves a milestone, it becomes eligible for payout.</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800 mb-1">You can track all activity</p>
                  <p>Keep an eye on released payouts and pending approvals from one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
