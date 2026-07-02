"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu03Icon } from '@hugeicons/core-free-icons'

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-providers", label: "For providers" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-slate-200/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
              <div className="w-full h-14 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
              <Image src="/bg-colored.png" alt="MilePay" width={150} height={100} loading="eager" style={{ width: "auto", height: "auto" }} />
            </div>
            {/* <span className="font-display font-bold text-lg text-forest-900 tracking-tight">
              MilePay
            </span> */}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm text-slate-400 hover:bg-slate-100 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-secondary btn-sm">
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg border border-forest-600 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={25} className="text-slate-300" /> : <HugeiconsIcon icon={Menu03Icon} size={25} className="text-slate-300" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 pt-3 space-y-1 bg-white shadow-sm rounded-lg mt-2 transition-opacity duration-300 px-3 py-2 my-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Link href="/login" className="btn-outline text-center">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-center">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
