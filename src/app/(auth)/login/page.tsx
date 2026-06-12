"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await authApi.login(data);
      const { token, user } = res.data as AuthResponse;
      setAuth(user, token);

      if (!user.emailVerified) {
        router.push("/verify-email");
        return;
      }
      if (!user.onboardingComplete) {
        router.push(`/onboarding/${user.role}`);
        return;
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
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
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-7">Sign in to your MilePay account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                {...register("email")}
                className="field-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label !mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-forest-600 hover:text-forest-800 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="field-input pr-10"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center gap-2 py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-forest-700 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Demo access */}
          <div className="border-t border-slate-100 mt-6 pt-5">
            <p className="text-xs text-slate-400 text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Provider", email: "provider@demo.ng", pw: "Demo1234" },
                { label: "Client",   email: "client@demo.ng",   pw: "Demo1234" },
                { label: "Admin",    email: "admin@demo.ng",    pw: "Demo1234" },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await authApi.login({ email: d.email, password: d.pw });
                      const { token, user } = res.data as AuthResponse;
                      setAuth(user, token);
                      router.push("/dashboard");
                    } catch {
                      toast.error("Demo login failed — check API connection");
                    }
                  }}
                  className="text-xs border border-slate-200 rounded-lg py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
