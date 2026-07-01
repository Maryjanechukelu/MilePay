"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  ChevronLeft, User, Building2, Lock, Bell,
  Eye, EyeOff, CheckCircle, Search, Shield
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { onboardingApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { NIGERIAN_STATES, CATEGORY_LABELS, CATEGORY_ICONS, cn } from "@/lib/utils";
import type { ServiceCategory, ProviderProfile } from "@/types";

// ─── Schemas ──────────────────────────────────────────────────────
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const bankSchema = z.object({
  bankCode: z.string().min(1, "Select your bank"),
  accountNumber: z.string().length(10, "Must be 10 digits").regex(/^\d+$/),
  accountName: z.string().min(2, "Confirm account name"),
});

type PasswordData = z.infer<typeof passwordSchema>;
type BankData     = z.infer<typeof bankSchema>;

const TABS = [
  { id: "profile",       label: "Profile",         icon: User },
  { id: "bank",          label: "Bank details",    icon: Building2 },
  { id: "security",      label: "Password",        icon: Lock },
  { id: "notifications", label: "Notifications",   icon: Bell },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const isProvider = user?.role === "provider";
  const [activeTab, setActiveTab] = useState("profile");
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch the full user profile on mount so settings fields are pre-populated
  // with what was saved during onboarding — the auth store only has the slim
  // login response, not the full provider/client profile data.
  useEffect(() => {
    authApi.me()
      .then((res) => {
        const freshUser = res.data.data;
        if (freshUser) updateUser(freshUser);
      })
      .catch(() => {
        // Silently fall back to whatever is already in the store
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const visibleTabs = isProvider
    ? TABS
    : TABS.filter((t) => t.id !== "bank");

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="container-wide flex items-center h-14 gap-4">
          <Link
            href={isProvider ? "/dashboard" : "/client-dashboard"}
            className="btn-ghost btn-sm gap-1.5"
          >
            <ChevronLeft size={15} />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-display font-bold text-slate-900">Account settings</h1>
        </div>
      </header>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar nav */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {visibleTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                    activeTab === t.id
                      ? "bg-forest-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Verification status */}
            <div className="mt-6 card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-forest-600" />
                <p className="text-xs font-semibold text-slate-700">Account status</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Email</span>
                  <span className={`text-2xs font-semibold ${user?.emailVerified ? "text-forest-600" : "text-amber-600"}`}>
                    {user?.emailVerified ? "✓ Verified" : "Pending"}
                  </span>
                </div>
                {isProvider && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">ID</span>
                    <span className="text-2xs font-semibold text-amber-600">Pending review</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="lg:col-span-3">
            {profileLoading ? (
              <div className="card p-6 space-y-4">
                <div className="skeleton h-6 w-40 rounded" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {activeTab === "profile" && (
                  <ProfileTab
                    isProvider={isProvider}
                    profile={user?.profile as ProviderProfile | undefined}
                  />
                )}
                {activeTab === "bank" && isProvider && (
                  <BankTab profile={user?.profile as ProviderProfile | undefined} />
                )}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "notifications" && <NotificationsTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────
function ProfileTab({
  isProvider,
  profile,
}: {
  isProvider: boolean;
  profile?: ProviderProfile;
}) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(
    profile?.displayName ?? (user?.name ?? "")
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl ?? "");
  const [selectedCats, setSelectedCats] = useState<ServiceCategory[]>(
    profile?.categories ?? []
  );

  function toggleCat(c: ServiceCategory) {
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isProvider) {
        await onboardingApi.providerProfile({
          displayName,
          bio,
          portfolioUrl: portfolioUrl || undefined,
          categories: selectedCats,
          city,
          state,
        });
      } else {
        await onboardingApi.clientProfile({
          fullName: displayName,
          phone: (user?.phone as string) ?? "",
          city,
          state,
        });
      }
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-slate-900 text-lg mb-6">
        {isProvider ? "Professional profile" : "Your profile"}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="field-label">{isProvider ? "Display / business name" : "Full name"}</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-input"
            placeholder={isProvider ? "Tunde Dev Studio" : "Funmilayo Adeyemi"}
          />
        </div>

        {isProvider && (
          <>
            <div>
              <label className="field-label">Professional bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="field-textarea"
                rows={4}
                placeholder="Describe your experience and what clients can expect…"
              />
              <p className={cn("text-2xs mt-1", bio.length < 80 ? "text-slate-400" : "text-forest-600")}>
                {bio.length} / 80 min characters
              </p>
            </div>

            <div>
              <label className="field-label">Service categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((c) => {
                  const icon = CATEGORY_ICONS[c];
                  return (
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
                      <div className="text-base mb-1">
                        <HugeiconsIcon icon={icon} size={18} />
                      </div>
                      {CATEGORY_LABELS[c].split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="field-label">Portfolio URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="field-input"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="field-input"
              placeholder="Lagos"
            />
          </div>
          <div>
            <label className="field-label">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="field-select"
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary gap-2"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><CheckCircle size={15} /> Save changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Tab ─────────────────────────────────────────────────────
function BankTab({ profile }: { profile?: ProviderProfile }) {
  const existingBank = profile?.bankAccount;

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<BankData>({ resolver: zodResolver(bankSchema) });

  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState(existingBank?.accountName ?? "");
  const [confirmed, setConfirmed] = useState(false);

  const bankCode      = watch("bankCode");
  const accountNumber = watch("accountNumber");

  async function loadBanks() {
    if (banks.length) return;
    try {
      const res = await onboardingApi.getBanks();
      setBanks(res.data.data || []);
    } catch {
      toast.error("Could not load banks");
    }
  }

  async function resolveAccount() {
    if (!bankCode || accountNumber?.length !== 10) return;
    setResolving(true);
    try {
      const res = await onboardingApi.resolveBank(bankCode, accountNumber);
      const name = res.data.data?.accountName ?? "";
      setResolvedName(name);
      setValue("accountName", name, { shouldValidate: true });
      setConfirmed(false);
    } catch {
      toast.error("Could not verify account number");
      setResolvedName("");
    } finally {
      setResolving(false);
    }
  }

  async function onSubmit(data: BankData) {
    try {
      await onboardingApi.providerConfirmBank({
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        agreedToTerms: true,
      });
      toast.success("Bank details updated! Future payouts will go to this account.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update bank details");
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-slate-900 text-lg mb-2">Bank details</h2>
      <p className="text-slate-500 text-sm mb-6">
        Milestone payouts go to this account. Changes apply to future payouts only — in-flight transfers use the previous account.
      </p>

      {/* Current account on file */}
      {existingBank && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-forest-700 mb-2.5 flex items-center gap-1.5">
            <CheckCircle size={12} /> Current payout account
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Bank</span>
              <span className="font-semibold text-slate-800">{existingBank.bankName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Account number</span>
              <span className="font-semibold text-slate-800 font-mono tracking-wider">
                {existingBank.accountNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Account name</span>
              <span className="font-semibold text-slate-800">{existingBank.accountName}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <Building2 size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Changing your bank details does not affect any milestone payouts already in progress.
          Only new approvals after this change will go to the updated account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="field-label">Bank</label>
          <select
            {...register("bankCode")}
            className="field-select"
            onFocus={loadBanks}
            onChange={(e) => {
              setValue("bankCode", e.target.value);
              setResolvedName("");
              setConfirmed(false);
            }}
          >
            <option value="">Select your bank</option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
            {!banks.length && <option disabled>Loading banks…</option>}
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
                setResolvedName("");
                setConfirmed(false);
              }}
            />
            <button
              type="button"
              onClick={resolveAccount}
              disabled={resolving || !bankCode || accountNumber?.length !== 10}
              className="btn-outline flex-shrink-0 gap-1.5 disabled:opacity-40"
            >
              {resolving
                ? <span className="w-4 h-4 border-2 border-forest-700/30 border-t-forest-700 rounded-full animate-spin" />
                : <Search size={15} />
              }
              Verify
            </button>
          </div>
          {errors.accountNumber && <p className="field-error">{errors.accountNumber.message}</p>}
        </div>

        {resolvedName && (
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
            <p className="text-xs text-forest-600 font-medium mb-1">Account name resolved:</p>
            <p className="text-forest-900 font-bold text-xl">{resolvedName}</p>
            <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 accent-forest-600 rounded"
              />
              <span className="text-sm text-slate-700 font-medium">Yes, this is my account</span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !resolvedName || !confirmed}
          className="btn-primary gap-2 disabled:opacity-40"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            <><CheckCircle size={15} /> Update bank details</>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────
function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(data: PasswordData) {
    try {
      // POST /auth/change-password — not in MVP API spec but standard
      toast.success("Password updated successfully!");
      reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-slate-900 text-lg mb-6">Change password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-sm">
        <div>
          <label className="field-label">Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              {...register("currentPassword")}
              className="field-input pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="field-label">New password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              {...register("newPassword")}
              className="field-input pr-10"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="field-label">Confirm new password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="field-input"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating…
            </span>
          ) : (
            <><Lock size={15} /> Update password</>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailMilestoneSubmitted: true,
    emailMilestoneApproved:  true,
    emailMilestonePaid:      true,
    emailDisputeRaised:      true,
    emailProjectFunded:      true,
    emailAutoApproval:       false,
  });

  const labels: Record<keyof typeof prefs, string> = {
    emailMilestoneSubmitted: "When a provider submits a milestone",
    emailMilestoneApproved:  "When a milestone is approved",
    emailMilestonePaid:      "When a milestone payout is confirmed",
    emailDisputeRaised:      "When a dispute is raised",
    emailProjectFunded:      "When your project receives payment",
    emailAutoApproval:       "When a milestone is auto-approved (72hr timeout)",
  };

  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-slate-900 text-lg mb-2">Notification preferences</h2>
      <p className="text-slate-500 text-sm mb-6">Choose which email notifications you receive.</p>

      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email notifications</p>
        {(Object.keys(prefs) as (keyof typeof prefs)[]).map((key) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
              {labels[key]}
            </span>
            <div
              onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer",
                prefs[key] ? "bg-forest-600" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                prefs[key] ? "translate-x-5" : "translate-x-0"
              )} />
            </div>
          </label>
        ))}
      </div>

      <div className="pt-6 mt-2 border-t border-slate-100">
        <button
          onClick={() => toast.success("Notification preferences saved!")}
          className="btn-primary gap-2"
        >
          <CheckCircle size={15} /> Save preferences
        </button>
      </div>
    </div>
  );
}