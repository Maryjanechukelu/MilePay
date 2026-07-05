"use client";
import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}