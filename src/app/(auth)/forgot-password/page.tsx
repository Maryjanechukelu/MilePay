"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordSchema } from "@/schemas";
import { authApi } from "@/lib/api";
import type { z } from "zod";

type ForgotPasswordData = z.infer<typeof import("@/schemas").forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordData) {
    try {
      await authApi.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      // Always show success to prevent email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
          <Link href="/" className="flex items-center">
            <div className="w-full flex items-center justify-center">
              <Image src="/logo-main.jpg" alt="MilePay" width={200} height={0} className="object-contain mb-0!" />
            </div>
          </Link>
        </div>

          <div className="card p-8 shadow-md text-center">
            <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-forest-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Check your email
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              If an account exists for{" "}
              <span className="font-semibold text-slate-800">{submittedEmail}</span>,
              you&apos;ll receive a password reset link within a few minutes.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-800">
                Check your spam folder if you don&apos;t see it in your inbox.
                The link expires after <strong>1 hour</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline w-full justify-center"
              >
                Try a different email
              </button>
              <Link href="/login" className="btn-ghost w-full justify-center gap-2">
                <ArrowLeft size={15} /> Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/" className="flex items-center">
            <div className="w-full flex items-center justify-center">
              <Image src="/logo-main.jpg" alt="MilePay" width={200} height={0} className="object-contain mb-0!" />
            </div>
          </Link>
        </div>

        <div className="card p-8 shadow-md">
          {/* Icon */}
          <div className="w-12 h-12 bg-forest-50 rounded-2xl flex items-center justify-center mb-5">
            <Mail size={22} className="text-forest-700" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
            Forgot your password?
          </h1>
          <p className="text-slate-500 text-sm mb-7 leading-relaxed">
            No problem. Enter your email and we&apos;ll send you a link to reset it.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                {...register("email")}
                className="field-input"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="field-error">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center gap-2 py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending reset link…
                </span>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
