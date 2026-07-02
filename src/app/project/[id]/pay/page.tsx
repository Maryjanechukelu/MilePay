"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Building2, Copy, CheckCircle, ArrowRight,
  RefreshCw, AlertCircle, Clock, Shield
} from "lucide-react";
import { projectApi } from "@/lib/api";
import { formatNaira, copyToClipboard } from "@/lib/utils";
import type { Project } from "@/types";

export default function PaymentInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, []);

  // Poll every 10s for payment confirmation
  useEffect(() => {
    if (!project || ["ACTIVE","COMPLETED","DISPUTED"].includes(project.state)) return;
    const interval = setInterval(() => {
      setPolling(true);
      projectApi.get(params.id as string)
        .then((res) => {
          const p = res.data.data as Project;
          setProject(p);
          if (["ACTIVE","COMPLETED"].includes(p.state)) {
            toast.success("Payment confirmed! Your project is now active.");
            router.push(`/project/${params.id}/manage`);
          }
        })
        .finally(() => setPolling(false));
    }, 10000);
    return () => clearInterval(interval);
  }, [project, params.id, router]);

  async function loadProject() {
    try {
      const res = await projectApi.get(params.id as string);
      const nextProject = res.data.data as Project;
      setProject(nextProject);

      if (!nextProject.virtualAccount) {
        setProvisioning(true);
        toast.loading("Preparing your virtual account…", { id: "virtual-account" });
      } else {
        setProvisioning(false);
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
  if (["ACTIVE","COMPLETED","DISPUTED"].includes(project.state)) {
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

        {/* Payment details */}
        {va ? (
          <div className="card p-6 mb-5 shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-forest-900 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
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
          </div>
        ) : (
          <div className="card p-6 mb-5 text-center">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Provisioning your virtual account…</p>
            <p className="text-xs text-slate-400 mt-1">This usually takes a few seconds.</p>
            <button
              onClick={() => {
                setProvisioning(true);
                toast.loading("Retrying virtual account setup…", { id: "virtual-account-retry" });
                loadProject().finally(() => {
                  toast.dismiss("virtual-account-retry");
                });
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
          <span>Checking for payment confirmation automatically…</span>
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
