"use client";
import { CheckCircle, Clock, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectState } from "@/types";

interface TimelineStep {
  state: ProjectState;
  label: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { state: "PENDING_ACCEPTANCE", label: "Sent to client" },
  { state: "PENDING_PAYMENT",    label: "Accepted" },
  { state: "ACTIVE",             label: "Funded & active" },
  { state: "COMPLETED",          label: "Completed" },
];

const STATE_ORDER: ProjectState[] = [
  "DRAFT",
  "PENDING_ACCEPTANCE",
  "PENDING_PAYMENT",
  "PARTIALLY_PAID",
  "ACTIVE",
  "COMPLETED",
];

interface StateTimelineProps {
  currentState: ProjectState;
  /** Compact renders a smaller horizontal version suited to cards/lists */
  compact?: boolean;
}

/**
 * Visual progress timeline showing where a project sits in its lifecycle.
 * Handles DISPUTED, CANCELLED, REFUNDED, and EXPIRED as special terminal
 * states that interrupt the normal flow.
 */
export function StateTimeline({ currentState, compact = false }: StateTimelineProps) {
  // Special terminal/interrupt states get their own banner instead of the step flow
  if (currentState === "DISPUTED") {
    return (
      <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
        <p className="text-sm font-medium text-red-800">Project is under dispute review</p>
      </div>
    );
  }

  if (currentState === "CANCELLED") {
    return (
      <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
        <Lock size={16} className="text-slate-500 flex-shrink-0" />
        <p className="text-sm font-medium text-slate-600">This project was cancelled</p>
      </div>
    );
  }

  if (currentState === "REFUNDED") {
    return (
      <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
        <CheckCircle size={16} className="text-purple-600 flex-shrink-0" />
        <p className="text-sm font-medium text-purple-800">Project funds were refunded to the client</p>
      </div>
    );
  }

  const currentIndex = STATE_ORDER.indexOf(currentState);

  return (
    <div className={cn("relative", compact ? "flex items-center" : "")}>
      {compact ? (
        // Compact horizontal dots — for cards/lists
        <div className="flex items-center gap-1.5 w-full">
          {TIMELINE_STEPS.map((step, i) => {
            const stepIndex = STATE_ORDER.indexOf(step.state);
            const done = currentIndex >= stepIndex;
            return (
              <div key={step.state} className="flex items-center flex-1">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  done ? "bg-forest-500" : "bg-slate-200"
                )} />
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-px mx-1",
                    currentIndex > stepIndex ? "bg-forest-300" : "bg-slate-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Full vertical timeline — for detail pages
        <div className="relative pl-1">
          <div className="absolute left-3 top-1 bottom-1 w-px bg-slate-100" />
          <div className="space-y-5">
            {TIMELINE_STEPS.map((step) => {
              const stepIndex = STATE_ORDER.indexOf(step.state);
              const done    = currentIndex >  stepIndex;
              const current = currentIndex === stepIndex;
              return (
                <div key={step.state} className="flex items-start gap-3 relative z-10">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white",
                    done || current ? "border-forest-600" : "border-slate-200"
                  )}>
                    {done ? (
                      <CheckCircle size={13} className="text-forest-600" />
                    ) : current ? (
                      <div className="w-2 h-2 rounded-full bg-forest-600 animate-pulse-dot" />
                    ) : (
                      <Clock size={11} className="text-slate-300" />
                    )}
                  </div>
                  <p className={cn(
                    "text-sm font-medium pt-0.5",
                    done ? "text-slate-900" : current ? "text-forest-700" : "text-slate-400"
                  )}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
