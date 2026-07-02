"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropboxIcon } from "@hugeicons/core-free-icons";

import { useProviderProjects } from "@/hooks/queries/useProjects";
import {
  formatNaira, relativeTime, PROJECT_STATE_CONFIG,
  MILESTONE_STATE_CONFIG, getMilestoneProgress, cn,
} from "@/lib/utils";
import type { Project, ProjectState } from "@/types";

const STATE_TABS: { label: string; value: ProjectState | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Disputed", value: "DISPUTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAGE_SIZE = 12;

export default function AllProjectsPage() {
  const router = useRouter();
  const [stateFilter, setStateFilter] = useState<ProjectState | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useProviderProjects({
    state: stateFilter === "ALL" ? undefined : stateFilter,
    page,
    limit: PAGE_SIZE,
  });

  const projects = data?.projects ?? [];
  const filtered = search.trim()
    ? projects.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : projects;

  function handleTabChange(value: ProjectState | "ALL") {
    setStateFilter(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="btn-icon btn-ghost">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-semibold text-slate-900 text-sm">All projects</h1>
          </div>
          <Link href="/projects/new" className="btn-primary gap-2 text-sm">
            <Plus size={16} /> New project
          </Link>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  stateFilter === tab.value
                    ? "bg-forest-800 text-white border-forest-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Could not load projects.{" "}
              <button onClick={() => window.location.reload()} className="font-semibold underline">
                Try again
              </button>.
            </p>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-5 w-48 mb-2 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={search.trim().length > 0 || stateFilter !== "ALL"} />
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <ProjectListRow key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-icon btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500">
              Page {data.page} of {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              className="btn-icon btn-ghost disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectListRow({ project }: { project: Project }) {
  const cfg = PROJECT_STATE_CONFIG[project.state];
  const progress = getMilestoneProgress(project.milestones ?? []);
  const nextMilestone = (project.milestones ?? []).find(
    (m) => m.state === "SUBMITTED" || m.state === "IN_PROGRESS"
  );

  return (
    <Link href={`/projects/${project.id}`} className="card-hover block p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{project.title}</h3>
          {/* <p className="text-xs text-slate-400 mt-0.5">
            {project.clientEmail ?? "No client yet"} · {relativeTime(project.createdAt)}
          </p> */}
        </div>
        <span className={`badge ${cfg.badgeClass} text-2xs flex-shrink-0`}>{cfg.label}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-2xs text-slate-400 mb-1">
          <span>{progress.completed}/{progress.total} milestones</span>
          <span className="font-medium text-forest-700">{formatNaira(project.totalAmount)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {nextMilestone && (
        <div className={cn(
          "text-xs rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5",
          MILESTONE_STATE_CONFIG[nextMilestone.state].badgeClass
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          {nextMilestone.title} — {MILESTONE_STATE_CONFIG[nextMilestone.state].label}
        </div>
      )}
    </Link>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <HugeiconsIcon icon={DropboxIcon} size={28} className="text-forest-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">
        {hasFilter ? "No matching projects" : "No projects yet"}
      </h3>
      <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
        {hasFilter
          ? "Try a different search term or filter."
          : "Create your first project to get started."}
      </p>
      {!hasFilter && (
        <Link href="/projects/new" className="btn-primary gap-2 inline-flex">
          <Plus size={15} /> Create first project
        </Link>
      )}
    </div>
  );
}