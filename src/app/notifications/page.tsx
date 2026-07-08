"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft, Bell, CheckCircle, Clock, AlertTriangle,
  Banknote, Package, RefreshCw, Filter
} from "lucide-react";
import { notificationApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { relativeTime, formatDateTime, cn } from "@/lib/utils";
import type { Notification } from "@/types";

const TYPE_CONFIG: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string; label: string }> = {
  project_funded: { icon: Banknote, color: "text-forest-600", bg: "bg-forest-50", label: "Funding" },
  milestone_submitted: { icon: Package, color: "text-blue-600", bg: "bg-blue-50", label: "Milestone" },
  milestone_approved: { icon: CheckCircle, color: "text-forest-600", bg: "bg-forest-50", label: "Milestone" },
  milestone_paid: { icon: Banknote, color: "text-amber-600", bg: "bg-amber-50", label: "Payout" },
  revision_requested: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Revision" },
  dispute_raised: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Dispute" },
  dispute_resolved: { icon: CheckCircle, color: "text-forest-600", bg: "bg-forest-50", label: "Dispute" },
  payment_received: { icon: Banknote, color: "text-forest-600", bg: "bg-forest-50", label: "Payment" },
  auto_approved: { icon: Clock, color: "text-slate-600", bg: "bg-slate-50", label: "Auto-approval" },
};

type FilterType = "all" | "unread";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const dashboardHref =
    user?.role === "provider" ? "/dashboard" :
      user?.role === "client" ? "/client-dashboard" :
        user?.role === "admin" ? "/admin" : "/";

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notificationApi.list(
        filter === "unread" ? { unread: true } : undefined
      );

      const raw = res.data.data;

      setNotifications(
        Array.isArray(raw)
          ? raw
          : raw?.notifications ?? []
      );
    } catch {
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNotifications(); }, [filter]);

  async function handleMarkRead(id: string) {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Could not mark as read");
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="container-wide flex items-center h-14 gap-4">
          <Link href={dashboardHref} className="btn-ghost btn-sm gap-1.5">
            <ChevronLeft size={15} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-display font-bold text-slate-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-forest-600 text-white text-2xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
      </header>

      <div className="container-narrow py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {([
              { id: "all" as const, label: "All" },
              { id: "unread" as const, label: "Unread" },
            ]).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  filter === f.id
                    ? "bg-forest-900 text-white"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="btn-ghost btn-sm gap-1.5 text-forest-700"
            >
              {markingAll ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <CheckCircle size={13} />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 flex gap-3">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-forest-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {filter === "unread"
                ? "You're all caught up!"
                : "You'll see updates about your projects and milestones here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.project_funded;
              const Icon = cfg.icon;
              const content = (
                <div
                  className={cn(
                    "card p-5 flex items-start gap-4 transition-all duration-150",
                    !n.read && "border-forest-200 bg-forest-50/30"
                  )}
                >
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={17} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wide">
                        {cfg.label}
                      </span>
                      {!n.read && <span className="w-1.5 h-1.5 bg-forest-500 rounded-full" />}
                    </div>
                    <p className={cn("text-sm font-medium leading-snug", !n.read ? "text-slate-900" : "text-slate-700")}>
                      {n.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(n.createdAt)} · {relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleMarkRead(n.id); }}
                      className="text-2xs text-forest-600 font-medium hover:underline flex-shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );

              return n.projectId ? (
                <Link
                  key={n.id}
                  href={`/project/${n.projectId}/manage`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className="block hover:opacity-90 transition-opacity"
                >
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
