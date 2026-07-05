"use client";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const active = [...ADMIN_NAV].reverse().find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href)
  );

  return (
    <header className="h-14 flex items-center gap-3 px-4 sm:px-8 border-b border-slate-200 bg-white sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <h1 className="font-display font-bold text-slate-900 text-lg truncate">{active?.label ?? "Admin"}</h1>
    </header>
  );
}