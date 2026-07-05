"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function VerifyEmailContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const { user, updateUser } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [verified, setVerified]   = useState(false);
  const token = params.get("token");

  // Auto-verify if token present in URL
  useState(() => {
    if (token) {
      authApi.verifyEmail(token)
        .then(() => {
          updateUser({ emailVerified: true });
          setVerified(true);
          toast.success("Email verified!");
          setTimeout(() => router.push(`/onboarding/${user?.role ?? "provider"}`), 1500);
        })
        .catch(() => toast.error("Verification link is invalid or expired"));
    }
  });

  async function handleResend() {
    if (!user?.email) return;
    setResending(true);
    try {
      await authApi.me(); // triggers resend on backend if not verified
      toast.success("Verification email resent! Check your inbox.");
    } catch {
      toast.error("Could not resend email");
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="card p-10 max-w-sm w-full text-center shadow-md">
          <CheckCircle size={48} className="text-forest-600 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Email verified!</h2>
          <p className="text-slate-500 text-sm">Redirecting you to complete your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="mb-6">
          <Link href="/" className="flex items-center">
              <div className="w-full flex items-center justify-center">
              <Image src="/logo-main.jpg" alt="MilePay" width={150} height={0} className="object-contain mb-0!" loading="eager" />
            </div>
          </Link>
        </div>

        <div className="card p-8 text-center shadow-md">
          <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-forest-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            We sent a verification link to{" "}
            <span className="font-semibold text-slate-800">{user?.email ?? "your email"}</span>.
            Click the link to verify your account and continue.
          </p>

          <button
            onClick={handleResend}
            disabled={resending}
            className="btn-outline w-full justify-center gap-2 mb-4"
          >
            {resending
              ? <><RefreshCw size={15} className="animate-spin" /> Sending…</>
              : <><RefreshCw size={15} /> Resend verification email</>
            }
          </button>

          <p className="text-xs text-slate-400">
            Wrong email?{" "}
            <Link href="/register" className="text-forest-600 font-medium hover:underline">
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
