"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  CheckCircle, Upload, Search, AlertCircle, ArrowRight, ArrowLeft, User,
  ShieldCheck, Building2, FileText
} from "lucide-react";
import {
  providerStep1Schema, providerStep2Schema, providerStep3Schema,
  type ProviderStep1Data, type ProviderStep2Data, type ProviderStep3Data,
} from "@/schemas";
import { onboardingApi, uploadApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { NIGERIAN_STATES, CATEGORY_LABELS, CATEGORY_ICONS, cn } from "@/lib/utils";
import type { ServiceCategory } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";

const STEPS = [
  { n: 1, label: "Profile", icon: User },
  { n: 2, label: "Identity", icon: ShieldCheck },
  { n: 3, label: "Bank", icon: Building2 },
  { n: 4, label: "Terms", icon: FileText },
];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [s1Data, setS1Data] = useState<ProviderStep1Data | null>(null);
  const [s2Data, setS2Data] = useState<ProviderStep2Data | null>(null);
  const [s3Data, setS3Data] = useState<ProviderStep3Data | null>(null);

  async function finishOnboarding() {
    try {
      await onboardingApi.providerConfirmBank({
        bankCode: s3Data!.bankCode,
        accountNumber: s3Data!.accountNumber,
        accountName: s3Data!.accountName,
        agreedToTerms: true,
      });
      updateUser({ onboardingComplete: true });
      toast.success("Account activated! Welcome to MilePay.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not activate account");
    }
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center">
            <div className="w-full flex items-center justify-center m-0!">
              <Image src="/logo-main.jpg" alt="MilePay" width={200} height={200} className="object-contain mb-4" />
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">Set up your provider account</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step} of 4 — takes about 3 minutes</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={cn(
                "step-dot",
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
                <div className={cn("w-8 h-px", step > s.n ? "bg-forest-400" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card p-6 sm:p-8 shadow-md">
          {step === 1 && (
            <Step1
              onNext={(d) => { setS1Data(d); setStep(2); }}
              defaultValues={s1Data ?? undefined}
            />
          )}
          {step === 2 && (
            <Step2
              onNext={(d) => { setS2Data(d); setStep(3); }}
              onBack={() => setStep(1)}
              defaultValues={s2Data ?? undefined}
            />
          )}
          {step === 3 && (
            <Step3
              onNext={(d) => { setS3Data(d); setStep(4); }}
              onBack={() => setStep(2)}
              defaultValues={s3Data ?? undefined}
            />
          )}
          {step === 4 && (
            <Step4
              bankAccountName={s3Data?.accountName ?? ""}
              onConfirm={finishOnboarding}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Professional Profile ────────────────────────────────
function Step1({
  onNext,
  defaultValues,
}: {
  onNext: (d: ProviderStep1Data) => void;
  defaultValues?: ProviderStep1Data;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<ProviderStep1Data>({
      resolver: zodResolver(providerStep1Schema),
      defaultValues: defaultValues ?? { categories: [] },
    });

  const selectedCats = watch("categories") || [];
  const categories = Object.keys(CATEGORY_LABELS) as ServiceCategory[];

  async function onSubmit(data: ProviderStep1Data) {
    try {
      await onboardingApi.providerProfile({
        displayName: data.displayName,
        categories: data.categories,
        bio: data.bio,
        portfolioUrl: data.portfolioUrl || undefined,
        city: data.city,
        state: data.state,
      });
      onNext(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  function toggleCat(c: ServiceCategory) {
    const current = selectedCats;
    setValue(
      "categories",
      current.includes(c) ? current.filter((x) => x !== c) : [...current, c],
      { shouldValidate: true }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Your professional profile</h2>
        <p className="text-slate-500 text-sm">This is what clients see when reviewing your project invitation.</p>
      </div>

      <div>
        <label className="field-label">Display name or business name</label>
        <input {...register("displayName")} className="field-input" placeholder="Tunde Dev Studio" />
        {errors.displayName && <p className="field-error">{errors.displayName.message}</p>}
      </div>

      <div>
        <label className="field-label">What services do you offer? <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCat(c)}
              className={cn(
                "p-2.5 rounded-xl border text-xs font-medium text-center transition-all",
                selectedCats.includes(c)
                  ? "border-forest-500 bg-forest-50 text-forest-800"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <div className="flex justify-center mb-1">
                <HugeiconsIcon
                  icon={CATEGORY_ICONS[c]}
                  size={22}
                  className={
                    selectedCats.includes(c)
                      ? "text-forest-700"
                      : "text-slate-500"
                  }
                />
              </div>
              {CATEGORY_LABELS[c].split(" ")[0]}
            </button>
          ))}
        </div>
        {errors.categories && <p className="field-error">{errors.categories.message}</p>}
      </div>

      <div>
        <label className="field-label">Professional bio</label>
        <textarea
          {...register("bio")}
          className="field-textarea"
          rows={4}
          placeholder="Describe your experience, skills, and what clients can expect from working with you… (min 80 characters)"
        />
        {errors.bio && <p className="field-error">{errors.bio.message}</p>}
      </div>

      <div>
        <label className="field-label">Portfolio URL <span className="text-slate-400 font-normal">(optional)</span></label>
        <input {...register("portfolioUrl")} className="field-input" placeholder="https://yourportfolio.com" />
        {errors.portfolioUrl && <p className="field-error">{errors.portfolioUrl.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">City</label>
          <input {...register("city")} className="field-input" placeholder="Lagos" />
          {errors.city && <p className="field-error">{errors.city.message}</p>}
        </div>
        <div>
          <label className="field-label">State</label>
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
          <>Continue to identity verification <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

// ─── Step 2: Identity Verification ───────────────────────────────
function Step2({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (d: ProviderStep2Data) => void;
  onBack: () => void;
  defaultValues?: ProviderStep2Data;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ProviderStep2Data>({
      resolver: zodResolver(providerStep2Schema),
      defaultValues,
    });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const onDropFront = useCallback((files: File[]) => { if (files[0]) setFrontFile(files[0]); }, []);
  const onDropBack = useCallback((files: File[]) => { if (files[0]) setBackFile(files[0]); }, []);

  const { getRootProps: getFrontProps, getInputProps: getFrontInput, isDragActive: frontDrag } =
    useDropzone({ onDrop: onDropFront, accept: { "image/*": [], "application/pdf": [] }, maxSize: 5 * 1024 * 1024, maxFiles: 1 });
  const { getRootProps: getBackProps, getInputProps: getBackInput, isDragActive: backDrag } =
    useDropzone({ onDrop: onDropBack, accept: { "image/*": [], "application/pdf": [] }, maxSize: 5 * 1024 * 1024, maxFiles: 1 });

  // async function onSubmit(data: ProviderStep2Data) {
  //   if (!frontFile) { toast.error("Upload the front of your ID"); return; }
  //   try {
  //     const idFrontUrl = await uploadApi.uploadFile(frontFile);
  //     const idBackUrl = backFile ? await uploadApi.uploadFile(backFile) : undefined;
  //     await onboardingApi.providerIdentity({
  //       idType: data.idType,
  //       idNumber: data.idNumber,
  //       idFrontUrl,
  //       idBackUrl,
  //     });
  //     onNext(data);
  //   } catch (err: unknown) {
  //     toast.error(err instanceof Error ? err.message : "Could not save identity info");
  //   }
  // }

  async function onSubmit(data: ProviderStep2Data) {
    try {
      // TODO: Replace these with actual upload URLs once the upload endpoint is ready
      const idFrontUrl = "temp-id-front";
      const idBackUrl = backFile ? "temp-id-back" : undefined;

      await onboardingApi.providerIdentity({
        idType: data.idType,
        idNumber: data.idNumber,
        idFrontUrl,
        idBackUrl,
      });

      onNext(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not save identity info"
      );
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Identity verification</h2>
        <p className="text-slate-500 text-sm">Your ID is stored securely and reviewed within 24 hours. You&apos;ll receive a verified badge once approved.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          ID verification is required to receive payouts. Clients will see a &ldquo;Verified&rdquo; badge on your profile.
        </p>
      </div>

      <div>
        <label className="field-label">ID type</label>
        <select {...register("idType")} className="field-select">
          <option value="">Select ID type</option>
          <option value="nin">NIN Slip</option>
          <option value="voters_card">Voter&apos;s Card</option>
          <option value="passport">International Passport</option>
          <option value="drivers_licence">Driver&apos;s Licence</option>
        </select>
        {errors.idType && <p className="field-error">{errors.idType.message}</p>}
      </div>

      <div>
        <label className="field-label">ID number</label>
        <input {...register("idNumber")} className="field-input" placeholder="Enter your ID number" />
        {errors.idNumber && <p className="field-error">{errors.idNumber.message}</p>}
      </div>

      <div>
        <label className="field-label">ID front <span className="text-red-500">*</span></label>
        <div
          {...getFrontProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            frontDrag ? "border-forest-400 bg-forest-50" : "border-slate-200 hover:border-slate-300"
          )}
        >
          <input {...getFrontInput()} />
          {frontFile ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-forest-600" />
              <span className="text-sm text-forest-700 font-medium">{frontFile.name}</span>
            </div>
          ) : (
            <div>
              <Upload size={20} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">Upload front of ID</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or PDF — max 5MB</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="field-label">ID back <span className="text-slate-400 font-normal">(optional)</span></label>
        <div
          {...getBackProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
            backDrag ? "border-forest-400 bg-forest-50" : "border-slate-200 hover:border-slate-300"
          )}
        >
          <input {...getBackInput()} />
          {backFile ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-forest-600" />
              <span className="text-sm text-forest-700 font-medium">{backFile.name}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Drag & drop or click — JPG, PNG, PDF</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-shrink-0 gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center gap-2 py-3">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </span>
          ) : (
            <>Continue to bank details <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: Bank Details ─────────────────────────────────────────
function Step3({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (d: ProviderStep3Data) => void;
  onBack: () => void;
  defaultValues?: ProviderStep3Data;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ProviderStep3Data>({
      resolver: zodResolver(providerStep3Schema),
      defaultValues,
    });

  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState(defaultValues?.accountName ?? "");
  const [confirmed, setConfirmed] = useState(false);

  const bankCode = watch("bankCode");
  const accountNumber = watch("accountNumber");

  async function loadBanks() {
    if (banks.length > 0) return;
    try {
      const res = await onboardingApi.getBanks();
      setBanks(res.data.data || []);
    } catch {
      toast.error("Could not load bank list");
    }
  }

  async function resolveAccount() {
    if (!bankCode || accountNumber?.length !== 10) return;
    setResolving(true);
    try {
      const res = await onboardingApi.resolveBank(bankCode, accountNumber);
      const name = res.data.data?.accountName || "";
      setResolvedName(name);
      setValue("accountName", name, { shouldValidate: true });
      setConfirmed(false);
    } catch {
      toast.error("Could not verify account. Check the number and bank.");
      setResolvedName("");
    } finally {
      setResolving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Bank account for payouts</h2>
        <p className="text-slate-500 text-sm">Milestone payments will be transferred to this account. You can change it later in settings.</p>
      </div>

      <div>
        <label className="field-label">Bank</label>
        <select
          {...register("bankCode")}
          className="field-select"
          onFocus={loadBanks}
          onChange={(e) => { setValue("bankCode", e.target.value); setResolvedName(""); setConfirmed(false); }}
        >
          <option value="">Select your bank</option>
          {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          {banks.length === 0 && <option disabled>Loading banks…</option>}
        </select>
        {errors.bankCode && <p className="field-error">{errors.bankCode.message}</p>}
      </div>

      <div>
        <label className="field-label">Account number</label>
        <div className="flex gap-2">
          <input
            {...register("accountNumber")}
            className="field-input"
            placeholder="0123456789"
            maxLength={10}
            inputMode="numeric"
            onChange={(e) => {
              setValue("accountNumber", e.target.value);
              setResolvedName(""); setConfirmed(false);
            }}
          />
          <button
            type="button"
            onClick={resolveAccount}
            disabled={resolving || !bankCode || accountNumber?.length !== 10}
            className="btn-outline flex-shrink-0 gap-1.5 disabled:opacity-40"
          >
            {resolving ? (
              <span className="w-4 h-4 border-2 border-forest-700/30 border-t-forest-700 rounded-full animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Verify
          </button>
        </div>
        {errors.accountNumber && <p className="field-error">{errors.accountNumber.message}</p>}
      </div>

      {resolvedName && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
          <p className="text-xs text-forest-600 font-medium mb-1">Account name resolved:</p>
          <p className="text-forest-900 font-bold text-lg">{resolvedName}</p>
          <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-forest-600 rounded"
            />
            <span className="text-sm text-slate-700 font-medium">
              Yes, this is my account
            </span>
          </label>
        </div>
      )}

      {errors.accountName && <p className="field-error">{errors.accountName.message}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-shrink-0 gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="submit"
          disabled={!resolvedName || !confirmed}
          className="btn-primary flex-1 justify-center gap-2 py-3 disabled:opacity-40"
        >
          Continue to terms <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

// ─── Step 4: Terms & Activation ───────────────────────────────────
function Step4({
  bankAccountName,
  onConfirm,
  onBack,
}: {
  bankAccountName: string;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleActivate() {
    if (!agreed) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Terms & activation</h2>
        <p className="text-slate-500 text-sm">Review and accept MilePay&apos;s provider terms to activate your account.</p>
      </div>

      {/* Terms scroll box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-3">
        <p className="font-bold text-slate-800">MilePay Provider Terms — Summary</p>
        <p><strong>Milestone payments:</strong> Funds are held in a dedicated Nomba virtual account until your client approves each milestone. Approval triggers an automatic transfer to your registered bank account.</p>
        <p><strong>Platform fee:</strong> MilePay deducts 2% from each milestone payout. This is the only fee charged to providers. There are no monthly, setup, or listing fees.</p>
        <p><strong>Auto-approval:</strong> If your client takes no action within 72 hours of your milestone submission, the milestone is automatically approved and payment is released.</p>
        <p><strong>Disputes:</strong> Either party may raise a dispute on a milestone. Funds are frozen during review. MilePay admin reviews evidence from both sides and makes a final decision within 48 business hours.</p>
        <p><strong>ID verification:</strong> You must complete identity verification to receive payouts. False or fraudulent ID submissions will result in immediate account suspension.</p>
        <p><strong>Prohibited use:</strong> MilePay may not be used for illegal services, money laundering, or any activity that violates Nigerian law.</p>
        <p>By activating your account, you confirm you have read and agree to all of the above terms and the full MilePay Terms of Service.</p>
      </div>

      {/* Summary */}
      <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-forest-700 mb-2">Account summary</p>
        {[
          ["Payout account", bankAccountName || "Confirmed"],
          ["Platform fee", "2% per milestone released"],
          ["Auto-approval", "72 hours after submission"],
          ["Status after activation", "Pending ID review (verified badge within 24hrs)"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-slate-500">{k}</span>
            <span className="font-semibold text-slate-800">{v}</span>
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
          I agree to MilePay&apos;s Provider Terms and understand how the milestone payment and auto-approval process works.
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
            <><CheckCircle size={16} /> Activate my provider account</>
          )}
        </button>
      </div>
    </div>
  );
}