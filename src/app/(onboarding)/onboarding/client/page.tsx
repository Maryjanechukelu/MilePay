"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle, User, FileText } from "lucide-react";
import { clientStep1Schema, type ClientStep1Data } from "@/schemas";
import { onboardingApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { NIGERIAN_STATES, cn, getSafeNextPath, consumePendingNext } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Profile", icon: User },
  { n: 2, label: "Terms", icon: FileText },
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [s1Data, setS1Data] = useState<ClientStep1Data | null>(null);

  async function finishOnboarding() {
    try {
      await onboardingApi.clientConfirm();
      updateUser({ onboardingComplete: true });
      toast.success("Account activated! Welcome to MilePay.");

      // Prefer whatever's in the URL right now; if that's missing (the
      // verification-email hop can lose it), fall back to what was
      // persisted when the client first clicked "Accept & fund". This is
      // the final stop, so consume (clear) it here rather than peek.
      const queryNext = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      const next = getSafeNextPath(queryNext) ?? consumePendingNext();

      router.push(next || "/client-dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not activate account");
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image src="/logo-main.jpg" alt="MilePay" width={150} height={0} className="object-contain mb-0!" loading="eager" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">Set up your client account</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step} of 2 — takes under a minute</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={cn("step-dot",
                step > s.n ? "step-dot-complete" : step === s.n ? "step-dot-active" : "step-dot-pending"
              )}>
                {step > s.n ? <CheckCircle size={14} /> : s.n}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block",
                step >= s.n ? "text-forest-700" : "text-slate-400"
              )}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("w-10 h-px", step > s.n ? "bg-forest-400" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8 shadow-md">
          {step === 1 && (
            <ClientStep1
              onNext={(d) => { setS1Data(d); setStep(2); }}
              defaultValues={s1Data ?? undefined}
            />
          )}
          {step === 2 && (
            <ClientStep2
              onConfirm={finishOnboarding}
              onBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ClientStep1({
  onNext,
  defaultValues,
}: {
  onNext: (d: ClientStep1Data) => void;
  defaultValues?: ClientStep1Data;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ClientStep1Data>({
      resolver: zodResolver(clientStep1Schema),
      defaultValues,
    });

  async function onSubmit(data: ClientStep1Data) {
    try {
      await onboardingApi.clientProfile(data);
      onNext(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Your profile</h2>
        <p className="text-slate-500 text-sm">This helps service providers know who they&apos;re working with.</p>
      </div>

      <div>
        <label className="field-label">Full name <span className="text-red-500">*</span></label>
        <input {...register("fullName")} className="field-input" placeholder="Funmilayo Adeyemi" autoComplete="name" />
        {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="field-label">Phone number <span className="text-red-500">*</span></label>
        <input type="tel" {...register("phone")} className="field-input" placeholder="08012345678" autoComplete="tel" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="field-label">Company or organisation <span className="text-slate-400 font-normal">(optional)</span></label>
        <input {...register("companyName")} className="field-input" placeholder="Adeyemi & Co." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">City <span className="text-red-500">*</span></label>
          <input {...register("city")} className="field-input" placeholder="Abuja" />
          {errors.city && <p className="field-error">{errors.city.message}</p>}
        </div>
        <div>
          <label className="field-label">State <span className="text-red-500">*</span></label>
          <select {...register("state")} className="field-select">
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="field-error">{errors.state.message}</p>}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center gap-2 py-3">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving…
          </span>
        ) : (
          <>Continue to terms <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

function ClientStep2({
  onConfirm,
  onBack,
}: {
  onConfirm: () => Promise<void>;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleActivate() {
    if (!agreed) return;
    setSubmitting(true);
    try { await onConfirm(); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Client terms</h2>
        <p className="text-slate-500 text-sm">Review how MilePay protects you as a client.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-52 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-3">
        <p className="font-bold text-slate-800">MilePay Client Terms — Summary</p>
        <p><strong>Payment protection:</strong> When you fund a project, your payment goes into a dedicated Nomba virtual account — not to the service provider. Funds are only released when you approve each milestone.</p>
        <p><strong>Milestone approval:</strong> You have 72 hours to review each milestone submission. If you take no action, the milestone is automatically approved and payment releases to the provider.</p>
        <p><strong>Revision requests:</strong> Before approving, you may request revisions. The provider must resubmit before payment releases.</p>
        <p><strong>Dispute process:</strong> If you have a serious concern, raise a dispute. Funds are frozen and MilePay admin reviews evidence from both parties within 48 business hours.</p>
        <p><strong>Refunds:</strong> Unfunded projects are fully refundable. Disputes resolved in your favour result in a full refund of the disputed milestone amount.</p>
        <p><strong>Free for clients:</strong> MilePay charges clients nothing. The 2% platform fee is deducted from the provider&apos;s payout.</p>
        <p>By activating your account, you agree to these terms and the full MilePay Terms of Service.</p>
      </div>

      {/* Key rules highlight */}
      <div className="space-y-2">
        {[
          { text: "72-hour review window — respond within 72 hours or milestone auto-approves", color: "bg-amber-50 border-amber-200 text-amber-800" },
          { text: "Funds are always protected — never released without your approval (or timeout)", color: "bg-forest-50 border-forest-200 text-forest-800" },
          { text: "Completely free for you — no fees, no subscriptions", color: "bg-blue-50 border-blue-200 text-blue-800" },
        ].map((r) => (
          <div key={r.text} className={`border rounded-lg px-3 py-2 text-xs font-medium ${r.color}`}>
            {r.text}
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 accent-forest-600 rounded mt-0.5 flex-shrink-0"
        />
        <span className="text-sm text-slate-700">
          I understand the 72-hour auto-approval rule and agree to MilePay&apos;s Client Terms.
        </span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-shrink-0 gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleActivate}
          disabled={!agreed || submitting}
          className="btn-primary flex-1 justify-center gap-2 py-3 disabled:opacity-40"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Activating…
            </span>
          ) : (
            <><CheckCircle size={16} /> Activate my client account</>
          )}
        </button>
      </div>
    </div>
  );
}