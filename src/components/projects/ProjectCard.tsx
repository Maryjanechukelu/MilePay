"use client";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import {
  formatNaira, relativeTime, PROJECT_STATE_CONFIG,
  MILESTONE_STATE_CONFIG, getMilestoneProgress, cn
} from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  /** "provider" shows client name + earnings framing, "client" shows provider name + spend framing */
  viewerRole: "provider" | "client";
  /** Where clicking the card should navigate to */
  href?: string;
}

/**
 * Reusable project summary row used across provider and client dashboards.
 * Shows progress bar, state badge, and a contextual call-out for the
 * next action needed (e.g. pending revision, milestone ready for review).
 */
export function ProjectCard({ project, viewerRole, href }: ProjectCardProps) {
  const cfg = PROJECT_STATE_CONFIG[project.state];
  const progress = getMilestoneProgress(project.milestones);

  const linkHref = href ?? `/project/${project.id}/manage`;

  // Contextual callout — differs by viewer role
  const callout = (() => {
    if (viewerRole === "provider") {
      const revision = project.milestones.find((m) => m.state === "REVISION_REQUESTED");
      if (revision) {
        return { text: `${revision.title} — revision requested`, cfgClass: MILESTONE_STATE_CONFIG.REVISION_REQUESTED.badgeClass };
      }
      const inProgress = project.milestones.find((m) => m.state === "IN_PROGRESS");
      if (inProgress) {
        return { text: `${inProgress.title} — in progress`, cfgClass: MILESTONE_STATE_CONFIG.IN_PROGRESS.badgeClass };
      }
      return null;
    } else {
      const pending = project.milestones.filter((m) => m.state === "SUBMITTED").length;
      if (pending > 0) {
        return {
          text: `${pending} milestone${pending > 1 ? "s" : ""} ready to review`,
          cfgClass: "badge-amber",
          icon: true,
        };
      }
      return null;
    }
  })();

  const counterpartLabel =
    viewerRole === "provider"
      ? (project.client ? `Client: ${project.client.fullName}` : "No client yet")
      : (project.provider ? project.provider.displayName : "Provider");

  return (
    <Link href={linkHref} className="card-hover block p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{project.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {counterpartLabel} · {relativeTime(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${cfg.badgeClass} text-2xs`}>{cfg.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>

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

      {callout && (
        <div className={cn("text-xs rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5", callout.cfgClass)}>
          {callout.icon && <Clock size={11} />}
          {!callout.icon && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
          {callout.text}
        </div>
      )}
    </Link>
  );
}
