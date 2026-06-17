"use client";
import { formatDateTime } from "@/lib/utils";
import type { AuditEvent } from "@/types";

interface AuditLogProps {
  events: AuditEvent[];
  /** Max number of events to show before requiring "view all". Default 10. */
  limit?: number;
  emptyText?: string;
}

/**
 * Reusable timestamped activity log for a project. Used on both provider
 * and client project detail pages to show a consistent audit trail.
 */
export function AuditLog({
  events,
  limit = 10,
  emptyText = "No activity recorded yet.",
}: AuditLogProps) {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-4">{emptyText}</p>;
  }

  const visible = events.slice(0, limit);

  return (
    <div className="space-y-3">
      {visible.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div className="w-1.5 h-1.5 bg-forest-400 rounded-full mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-700 leading-relaxed">{event.description}</p>
            <p className="text-2xs text-slate-400 mt-0.5">
              {formatDateTime(event.createdAt)} · {event.actorName} ({event.actorRole})
            </p>
          </div>
        </div>
      ))}
      {events.length > limit && (
        <p className="text-2xs text-slate-400 text-center pt-1">
          +{events.length - limit} earlier events
        </p>
      )}
    </div>
  );
}
