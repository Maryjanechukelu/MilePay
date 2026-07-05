"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, X, LogOutIcon } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { useAdminDisputes, useAdminUnmatchedPayments } from "@/hooks/queries/useAdmin";

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: disputes } = useAdminDisputes();
  const { data: unmatched } = useAdminUnmatchedPayments();

  const counts: Record<string, number> = {
    disputes: disputes?.length ?? 0,
    unmatched: unmatched?.length ?? 0,
  };

  return (
    <>
      {/* Backdrop — mobile only, closes the drawer on tap outside */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "w-60 flex-shrink-0 bg-forest-950 border-r border-forest-800 flex flex-col",
          // Desktop: always visible, part of the flex layout, sticky.
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          // Mobile: fixed off-canvas panel, slides in/out.
          "fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center gap-2 px-5 border-b border-forest-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
                <div className="w-full h-8 flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
                <Image src="/bg-colored.png" alt="MilePay" width={80} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
              </div>
            </Link>
          <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/30 text-2xs ml-auto">Admin</span>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden ml-1 p-1.5 rounded-md text-forest-400 hover:text-white hover:bg-forest-900"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
            const count = item.countKey ? counts[item.countKey] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-forest-800 text-white" : "text-forest-400 hover:bg-forest-900 hover:text-white"
                )}
              >
                <HugeiconsIcon icon={item.icon} size={16} className="flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {!!count && count > 0 && (
                  <span className={cn(
                    "text-2xs font-bold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/15 text-white" : "bg-forest-800 text-forest-200"
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-forest-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-forest-400 hover:text-white hover:bg-forest-900 transition-colors">
            <LogOutIcon size={14} /> Exit admin
          </Link>
        </div>
      </aside>
    </>
  );
}