"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, Suspense } from "react";
import { Eye, EyeOff, ArrowRight, Briefcase, User } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "@/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (params.get("role") as "provider" | "client") || "provider",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormData) {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      const { token, user } = res.data as AuthResponse;
      setAuth(user, token);
      toast.success("Account created! Please verify your email.");
      router.push("/verify-email");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not create account. Please try again.";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-forest-900 rounded-xl flex items-center justify-center">
              <span className="text-amber-400 font-display font-extrabold">M</span>
            </div>
            <span className="font-display font-bold text-xl text-forest-900">MilePay</span>
          </Link>
        </div>

        <div className="card p-8 shadow-md">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-6">Start protecting your payments in minutes</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { value: "provider", label: "I provide services", icon: Briefcase, sub: "Freelancer, tutor, consultant…" },
              { value: "client",   label: "I hire services",    icon: User,      sub: "Business owner, individual…"  },
            ] as const).map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue("role", r.value)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-150",
                  selectedRole === r.value
                    ? "border-forest-600 bg-forest-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <r.icon
                  size={18}
                  className={selectedRole === r.value ? "text-forest-700 mb-2" : "text-slate-400 mb-2"}
                />
                <p className={cn("text-xs font-bold mb-0.5 leading-tight",
                  selectedRole === r.value ? "text-forest-900" : "text-slate-700"
                )}>
                  {r.label}
                </p>
                <p className="text-xs text-slate-400 leading-tight">{r.sub}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input {...register("name")} className="field-input" placeholder="Chiamaka Osei" autoComplete="name" />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="field-label">Email address</label>
              <input type="email" {...register("email")} className="field-input" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Phone number</label>
              <input type="tel" {...register("phone")} className="field-input" placeholder="08012345678" autoComplete="tel" />
              {errors.phone && <p className="field-error">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="field-input pr-10"
                  placeholder="Min 8 chars, one uppercase, one number"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="field-input pr-10"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to MilePay&apos;s{" "}
              <Link href="/terms" className="text-forest-600 hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-forest-600 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center gap-2 py-3">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-forest-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
