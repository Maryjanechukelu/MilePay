"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, Clock, AlertTriangle, Banknote, Package } from "lucide-react";
import { notificationApi } from "@/lib/api";
import { relativeTime, cn } from "@/lib/utils";
import type { Notification } from "@/types";

const TYPE_CONFIG = {
  project_funded:      { icon: Banknote,      color: "text-forest-600",  bg: "bg-forest-50"  },
  milestone_submitted: { icon: Package,       color: "text-blue-600",    bg: "bg-blue-50"    },
  milestone_approved:  { icon: CheckCircle,   color: "text-forest-600",  bg: "bg-forest-50"  },
  milestone_paid:      { icon: Banknote,      color: "text-amber-600",   bg: "bg-amber-50"   },
  revision_requested:  { icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50"   },
  dispute_raised:      { icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50"     },
  dispute_resolved:    { icon: CheckCircle,   color: "text-forest-600",  bg: "bg-forest-50"  },
  payment_received:    { icon: Banknote,      color: "text-forest-600",  bg: "bg-forest-50"  },
  auto_approved:       { icon: Clock,         color: "text-slate-600",   bg: "bg-slate-50"   },
};

interface NotificationsPanelProps {
  isOpen:   boolean;
  onClose:  () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationApi.list()
        .then((res) => setNotifications(res.data.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  async function markAllRead() {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  async function markRead(id: string) {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read: true } : n)
      );
    } catch {}
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-16 right-4 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-forest-600 text-white text-2xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-forest-600 font-medium hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="btn-ghost btn-icon">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.project_funded;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors",
                          !n.read && "bg-forest-50/40"
                        )}
                      >
                        <div className={`w-8 h-8 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-medium leading-snug", !n.read ? "text-slate-900" : "text-slate-600")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-2xs text-slate-400 mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-forest-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
