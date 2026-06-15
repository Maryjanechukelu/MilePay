import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Search, Shield } from "lucide-react";

export default function NotFoundPage() {
  const suggestions = [
    { href: "/", label: "Home", icon: Home, desc: "Back to the landing page" },
    { href: "/login", label: "Sign in", icon: Shield, desc: "Access your account" },
    { href: "/register", label: "Create account", icon: Search, desc: "Get started for free" },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Minimal nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="container-wide flex items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-full h-12 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
              <Image src="/bg-colored.png" alt="MilePay" width={120} height={50} />
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">

          {/* Large 404 */}
          <div className="relative mb-8 select-none">
            <p className="font-display font-black text-[10rem] leading-none text-slate-100 tracking-tight">
              404
            </p>
            {/* Overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-forest-900 rounded-3xl flex items-center justify-center shadow-lg">
                <Image src="/logo-icon.png" alt="MilePay" width={40} height={32} />
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
            Page not found
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-sm mx-auto">
            This page doesn&apos;t exist or may have been moved.
            If you followed a project link, ask the service provider to resend it.
          </p>

          {/* Suggestion cards */}
          {/* <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="card-hover p-4 text-left group"
              >
                <div className="w-9 h-9 bg-forest-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-forest-100 transition-colors">
                  <s.icon size={16} className="text-forest-700" />
                </div>
                <p className="font-semibold text-slate-900 text-sm mb-0.5">{s.label}</p>
                <p className="text-slate-400 text-xs">{s.desc}</p>
              </Link>
            ))}
          </div> */}

          {/* Back button */}
          <Link
            href="/"
            className="btn-outline inline-flex items-center gap-2"
          >
            <ArrowLeft size={15} /> Go back home
          </Link>
        </div>
      </main>

      {/* Footer note */}
      <footer className="py-5 text-center">
        <p className="text-xs text-slate-400">
          Looking for a project link? Ask your provider to share a new one from their MilePay dashboard.
        </p>
      </footer>
    </div>
  );
}
