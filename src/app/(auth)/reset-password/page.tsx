"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { resetPasswordSchema } from "@/schemas";
import { authApi } from "@/lib/api";
import type { z } from "zod";

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router     = useRouter();
  const params     = useSearchParams();
  const token      = params.get("token");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess]         = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  const rules = [
    { label: "At least 8 characters",  met: password.length >= 8 },
    { label: "One uppercase letter",   met: /[A-Z]/.test(password) },
    { label: "One number",             met: /[0-9]/.test(password) },
  ];

  async function onSubmit(data: ResetPasswordData) {
    if (!token) {
      toast.error("Reset link is invalid or missing. Request a new one.");
      return;
    }
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reset password";
      toast.error(msg);
    }
  }

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
          <Link href="/" className="flex items-center">
              <div className="w-full flex items-center justify-center">
              <Image src="/logo-main.jpg" alt="MilePay" width={150} height={0} className="object-contain mb-0!" loading="eager" />
            </div>
          </Link>
        </div>

          <div className="card p-8 shadow-md text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900 mb-2">
              Invalid reset link
            </h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              This password reset link is invalid or has expired.
              Reset links are only valid for <strong>1 hour</strong>.
            </p>
            <Link href="/forgot-password" className="btn-primary w-full justify-center">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-forest-900 rounded-xl flex items-center justify-center">
                <span className="text-amber-400 font-display font-extrabold">M</span>
              </div>
              <span className="font-display font-bold text-xl text-forest-900">MilePay</span>
            </Link>
          </div>

          <div className="card p-8 shadow-md text-center">
            <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-forest-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Password updated!
            </h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your password has been changed successfully.
              Redirecting you to sign in…
            </p>

            {/* Animated progress bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-forest-500 rounded-full animate-[grow_3s_linear_forwards]"
                style={{
                  animation: "grow 3s linear forwards",
                  width: "0%",
                }}
              />
            </div>

            <Link href="/login" className="btn-primary w-full justify-center">
              Sign in now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-forest-900 rounded-xl flex items-center justify-center">
              <span className="text-amber-400 font-display font-extrabold">M</span>
            </div>
            <span className="font-display font-bold text-xl text-forest-900">MilePay</span>
          </Link>
        </div>

        <div className="card p-8 shadow-md">
          {/* Icon */}
          <div className="w-12 h-12 bg-forest-50 rounded-2xl flex items-center justify-center mb-5">
            <Lock size={22} className="text-forest-700" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
            Set a new password
          </h1>
          <p className="text-slate-500 text-sm mb-7">
            Choose a strong password for your MilePay account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New password */}
            <div>
              <label className="field-label">New password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="field-input pr-10"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}

              {/* Strength checklist */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {rules.map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        r.met ? "bg-forest-500" : "bg-slate-200"
                      }`}>
                        {r.met && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs transition-colors ${
                        r.met ? "text-forest-700 font-medium" : "text-slate-400"
                      }`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="field-label">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="field-input pr-10"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword.message}</p>
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
                  Updating password…
                </span>
              ) : (
                <><Lock size={15} /> Set new password</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Remembered it?{" "}
            <Link href="/login" className="text-forest-700 font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
