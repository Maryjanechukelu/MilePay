"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Building2, Copy, CheckCircle, ArrowRight,
  RefreshCw, AlertCircle, Clock, Shield, LifeBuoy, Send
} from "lucide-react";
import { projectApi } from "@/lib/api";
import { formatNaira, copyToClipboard } from "@/lib/utils";
import type { Project } from "@/types";

// After this many seconds of no virtual account, stop implying "any second
// now" and tell the client this looks stuck instead.
const STUCK_AFTER_SECONDS = 60;

// After this many seconds of the client saying "I've sent it" with no
// state change, switch from "confirming automatically" to "this looks
// stuck." Slightly longer than the provisioning threshold since bank
// transfers can genuinely take a bit longer than account setup.
const PAYMENT_STUCK_AFTER_SECONDS = 90;

// While waiting on a virtual account or on normal payment confirmation.
const NORMAL_POLL_MS = 10000;
// Once the client has told us they sent the transfer, check more often —
// they're actively waiting on this screen, not just holding it open.
const REPORTED_POLL_MS = 4000;

// Where a client should go if provisioning or payment confirmation is
// genuinely stuck. Swap this for your real support channel.
const SUPPORT_CONTACT_URL = "mailto:support@milepay.ng";

export default function PaymentInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // When we first noticed there was no virtual account yet.
  const provisioningStartedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // "I've sent it" — client-reported payment, tracked separately from the
  // provisioning clock above since they're different waits with different
  // thresholds and different messaging.
  const [paymentReported, setPaymentReported] = useState(false);
  const paymentReportedAtRef = useRef<number | null>(null);
  const [paymentElapsedSeconds, setPaymentElapsedSeconds] = useState(0);

  useEffect(() => {
    loadProject();
  }, []);

  // Poll for payment confirmation. Interval shortens once the client has
  // told us they sent the transfer — they're actively watching this page.
  useEffect(() => {
    if (!project || ["ACTIVE", "COMPLETED", "DISPUTED"].includes(project.state)) return;
    const ms = paymentReported ? REPORTED_POLL_MS : NORMAL_POLL_MS;
    const interval = setInterval(() => {
      setPolling(true);
      projectApi.get(params.id as string)
        .then((res) => {
          const p = res.data.data as Project;
          setProject(p);
          if (["ACTIVE", "COMPLETED"].includes(p.state)) {
            toast.success("Payment confirmed! Your project is now active.");
            router.push(`/project/${params.id}/manage`);
          }
        })
        .finally(() => setPolling(false));
    }, ms);
    return () => clearInterval(interval);
  }, [project, params.id, router, paymentReported]);

  // Tick every second while we're waiting on a virtual account.
  useEffect(() => {
    if (!provisioning) return;
    const tick = setInterval(() => {
      if (provisioningStartedAtRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - provisioningStartedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [provisioning]);

  // Tick every second while waiting on payment confirmation after the
  // client has told us they sent it.
  useEffect(() => {
    if (!paymentReported) return;
    const tick = setInterval(() => {
      if (paymentReportedAtRef.current) {
        setPaymentElapsedSeconds(Math.floor((Date.now() - paymentReportedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [paymentReported]);

  async function loadProject() {
    try {
      const res = await projectApi.get(params.id as string);
      const nextProject = res.data.data as Project;
      setProject(nextProject);

      if (!nextProject.virtualAccount) {
        setProvisioning(true);
        if (!provisioningStartedAtRef.current) {
          provisioningStartedAtRef.current = Date.now();
          setElapsedSeconds(0);
        }
      } else {
        setProvisioning(false);
        provisioningStartedAtRef.current = null;
        setElapsedSeconds(0);
        toast.dismiss("virtual-account");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not load project details";
      toast.error(message);
      setProvisioning(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(value: string, field: string) {
    await copyToClipboard(value);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handleReportPayment() {
    setPaymentReported(true);
    paymentReportedAtRef.current = Date.now();
    setPaymentElapsedSeconds(0);
    toast.success("Got it — checking for your payment now.");
    // Immediate check, don't just wait for the next interval tick.
    loadProject();
  }

  function handleCheckPaymentNow() {
    toast.loading("Checking again…", { id: "payment-check" });
    loadProject().finally(() => toast.dismiss("payment-check"));
  }

  const isStuck = provisioning && elapsedSeconds >= STUCK_AFTER_SECONDS;
  const isPaymentStuck = paymentReported && paymentElapsedSeconds >= PAYMENT_STUCK_AFTER_SECONDS;

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-slate-900 mb-2">Project not found</p>
        <Link href="/client-dashboard" className="btn-primary btn-sm">Go to dashboard</Link>
      </div>
    </div>
  );

  // Already funded
  if (["ACTIVE", "COMPLETED", "DISPUTED"].includes(project.state)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full card p-8 text-center">
          <CheckCircle size={40} className="text-forest-600 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Project is funded!</h2>
          <p className="text-slate-500 text-sm mb-5">Your payment has been confirmed and the project is now active.</p>
          <Link href={`/project/${project.id}/manage`} className="btn-primary w-full justify-center gap-2">
            Go to project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const va = project.virtualAccount;
  const isPartiallyPaid = project.state === "PARTIALLY_PAID";

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-slate-100">
        <div className="container-wide flex items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-full h-12 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
              <Image src="/bg-colored.png" alt="MilePay" width={120} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
            </div>
          </Link>
        </div>
      </header>

      <div className="container-form py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={26} className="text-forest-700" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
            {isPartiallyPaid ? "Top up your payment" : "Fund your project"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isPartiallyPaid
              ? "We received a partial payment. Please send the remaining amount to the same account."
              : "Transfer the exact amount below to your project's dedicated account. MilePay will confirm automatically."}
          </p>
        </div>

        {/* Underpayment alert */}
        {isPartiallyPaid && va && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-5 flex gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Partial payment received</p>
              <p className="text-xs text-amber-700 mt-0.5">
                We received <strong>{formatNaira(va.paidAmount)}</strong> but the project requires <strong>{formatNaira(va.expectedAmount)}</strong>.
                Please send the remaining <strong className="text-amber-900">{formatNaira(va.underpayment)}</strong> to the same account number below.
              </p>
            </div>
          </div>
        )}

        {/* Project summary */}
        <div className="card p-5 mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Project</p>
              <p className="font-semibold text-slate-900 text-sm">{project.title}</p>
              <p className="text-xs text-slate-500">{project.provider?.displayName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-0.5">
                {isPartiallyPaid ? "Remaining balance" : "Total to pay"}
              </p>
              <p className="font-display text-2xl font-extrabold text-forest-900 tabular-nums">
                {formatNaira(isPartiallyPaid ? (va?.underpayment ?? 0) : project.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment details / provisioning / stuck states */}
        {va ? (
          <div className="card p-6 mb-5 shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-forest-900 rounded-lg flex items-center justify-center">
               <Image src="/logo-icon.png" alt="MilePay" width={20} height={20} className="object-contain mb-0!" loading="eager" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Your project payment account</p>
                <p className="text-2xs text-slate-400">Unique to this project · Nomba Microfinance Bank</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Bank name",       value: va.bankName,       field: "Bank name",       copyable: false },
                { label: "Account number",  value: va.accountNumber,  field: "Account number",  copyable: true },
                { label: "Account name",    value: va.accountName,    field: "Account name",    copyable: true },
                {
                  label: "Amount",
                  value: formatNaira(isPartiallyPaid ? (va.underpayment ?? 0) : va.expectedAmount),
                  field: "Amount",
                  copyable: true,
                  rawValue: String(isPartiallyPaid ? (va.underpayment ?? 0) : va.expectedAmount),
                  highlight: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    row.highlight
                      ? "bg-forest-50 border border-forest-200"
                      : "bg-slate-50 border border-slate-100"
                  }`}
                >
                  <div>
                    <p className="text-2xs text-slate-400 font-medium">{row.label}</p>
                    <p className={`font-semibold text-sm ${row.highlight ? "text-forest-900 font-extrabold font-display text-lg" : "text-slate-900"}`}>
                      {row.value}
                    </p>
                  </div>
                  {row.copyable && (
                    <button
                      onClick={() => handleCopy(row.rawValue ?? row.value, row.field)}
                      className={`btn-sm gap-1.5 transition-all ${
                        copiedField === row.field ? "bg-forest-600 text-white" : "btn-outline"
                      }`}
                    >
                      <Copy size={11} />
                      {copiedField === row.field ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Screenshot hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 flex gap-2">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Screenshot these details before leaving this page. Use them exactly — any error may cause a misdirected payment.
              </p>
            </div>

            {/* "I've sent it" / payment status */}
            {!paymentReported ? (
              <button
                onClick={handleReportPayment}
                className="btn-secondary w-full justify-center gap-2 mt-4"
              >
                <Send size={14} /> I&apos;ve made this transfer
              </button>
            ) : isPaymentStuck ? (
              <div className="mt-4 border border-amber-200 bg-amber-50/60 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2.5">
                  <AlertCircle size={18} className="text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Still waiting on confirmation</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
                  It's been a little while since you told us you sent the transfer and we haven't
                  confirmed it yet. We're still checking automatically — if you have a bank receipt
                  or reference number, reach out and we'll trace it directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-3.5">
                  <a
                    href={`${SUPPORT_CONTACT_URL}?subject=${encodeURIComponent(
                      `Payment not confirmed — project ${project.id}`
                    )}`}
                    className="btn-primary btn-sm gap-2 justify-center"
                  >
                    <LifeBuoy size={13} /> Contact support
                  </a>
                  <button
                    onClick={handleCheckPaymentNow}
                    className="btn-ghost btn-sm gap-2 justify-center"
                  >
                    <RefreshCw size={12} /> Check again
                  </button>
                </div>
                <p className="text-2xs text-slate-400 mt-3">
                  Reference: <span className="font-mono">{project.id}</span> — share this with support
                </p>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-forest-700 bg-forest-50 border border-forest-200 rounded-xl px-3 py-2.5">
                <RefreshCw size={13} className="animate-spin flex-shrink-0" />
                <span>Checking for your payment — this usually confirms within a minute.</span>
              </div>
            )}
          </div>
        ) : isStuck ? (
          <div className="card p-6 mb-5 text-center border-amber-200">
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={22} className="text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">This is taking longer than expected</p>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
              We're still trying to set up your payment account. This is unusual — you don't need to
              keep waiting here. We'll keep checking automatically, but if it's still not ready soon,
              reach out and we'll sort it out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <a
                href={`${SUPPORT_CONTACT_URL}?subject=${encodeURIComponent(
                  `Payment account not ready — project ${project.id}`
                )}`}
                className="btn-primary btn-sm gap-2 justify-center"
              >
                <LifeBuoy size={13} /> Contact support
              </a>
              <button
                onClick={() => {
                  toast.loading("Checking again…", { id: "virtual-account-retry" });
                  loadProject().finally(() => toast.dismiss("virtual-account-retry"));
                }}
                className="btn-ghost btn-sm gap-2 justify-center"
              >
                <RefreshCw size={12} /> Check again
              </button>
            </div>
            <p className="text-2xs text-slate-400 mt-3">
              Reference: <span className="font-mono">{project.id}</span> — share this with support
            </p>
          </div>
        ) : (
          <div className="card p-6 mb-5 text-center">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Preparing your virtual account…</p>
            <p className="text-xs text-slate-400 mt-1">This usually takes a few seconds.</p>
            <button
              onClick={() => {
                toast.loading("Retrying virtual account setup…", { id: "virtual-account-retry" });
                loadProject().finally(() => toast.dismiss("virtual-account-retry"));
              }}
              className="btn-ghost btn-sm mt-4 gap-2"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* How it works steps */}
        <div className="card p-5 mb-5">
          <p className="text-xs font-semibold text-slate-700 mb-3">What happens next</p>
          <div className="space-y-3">
            {[
              { n: "1", text: "Open your bank app (GTBank, Access, Zenith, OPay, Kuda — any Nigerian bank)" },
              { n: "2", text: "Transfer the exact amount to the account number above" },
              { n: "3", text: "MilePay confirms automatically — usually within 60 seconds" },
              { n: "4", text: "Your project becomes Active and the provider can start work" },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="w-5 h-5 bg-forest-900 text-white rounded-full text-2xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Protection reminder */}
        <div className="card-muted p-4 mb-6">
          <div className="flex gap-2.5">
            <Shield size={15} className="text-forest-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-forest-800 leading-relaxed">
              <strong>Your money is protected.</strong> Funds go into a Nomba virtual account — not to the provider.
              They cannot access any funds until you approve each milestone.
            </p>
          </div>
        </div>

        {/* Polling status */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          {polling ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Clock size={13} />
          )}
          <span>
            {paymentReported
              ? "Checking every few seconds since you reported your transfer…"
              : "Checking for payment confirmation automatically…"}
          </span>
        </div>

        <div className="mt-6 text-center">
          <Link href="/client-dashboard" className="text-xs text-slate-400 hover:text-slate-600">
            I&apos;ll pay later — go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}