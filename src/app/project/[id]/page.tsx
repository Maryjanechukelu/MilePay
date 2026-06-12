"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Shield, CheckCircle, Lock, ArrowRight, Star, Clock,
  AlertTriangle, Banknote, Building2, Copy, ChevronRight
} from "lucide-react";
import { projectApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  formatNaira, formatDate, copyToClipboard,
  PROJECT_STATE_CONFIG, CATEGORY_LABELS, cn
} from "@/lib/utils";
import type { Project } from "@/types";

export default function ProjectPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    projectApi.getPublic(params.id as string)
      .then((res) => setProject(res.data.data))
      .catch(() => toast.error("Project not found or link has expired"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleAccept() {
    if (!isAuthenticated) {
      router.push(`/register?role=client&next=/project/${params.id}`);
      return;
    }
    if (user?.role === "provider") {
      toast.error("You're logged in as a provider. Share this link with your client.");
      return;
    }
    setAccepting(true);
    try {
      await projectApi.accept(params.id as string);
      toast.success("Project accepted! Proceeding to payment…");
      router.push(`/project/${params.id}/pay`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not accept project");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <ProjectPreviewSkeleton />;
  if (!project) return <ProjectNotFound />;

  const stateCfg = PROJECT_STATE_CONFIG[project.state];
  const isOwner = isAuthenticated && user?.id === project.providerId;
  const alreadyFunded = ["ACTIVE","COMPLETED","DISPUTED"].includes(project.state);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-900 rounded-lg flex items-center justify-center">
              <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
            </div>
            <span className="font-display font-bold text-forest-900">MilePay</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="btn-ghost btn-sm">Sign in</Link>
                <Link href="/register" className="btn-primary btn-sm">Sign up free</Link>
              </>
            ) : (
              <Link href="/dashboard" className="btn-ghost btn-sm">Dashboard</Link>
            )}
          </div>
        </div>
      </header>

      <div className="container-wide py-10">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Project header */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className={`badge ${stateCfg.badgeClass} mb-3`}>{stateCfg.label}</span>
                  <h1 className="font-display text-2xl font-bold text-slate-900 mb-1 leading-tight">
                    {project.title}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Created {formatDate(project.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                    {formatNaira(project.totalAmount)}
                  </p>
                  <p className="text-xs text-slate-400">total project value</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
            </div>

            {/* Provider card */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-4">Service provider</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-forest-800 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {project.provider.displayName?.charAt(0) ?? "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{project.provider.displayName}</p>
                    {project.provider.idVerified && (
                      <span className="badge badge-green text-2xs gap-1">
                        <CheckCircle size={10} /> ID Verified
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {project.provider.categories?.map((c) => CATEGORY_LABELS[c]).join(", ")}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star size={11} className="fill-current" />
                      <span className="font-semibold">{project.provider.trustScore}</span>
                      <span className="text-slate-400 font-normal">trust score</span>
                    </div>
                    <span className="text-slate-200">·</span>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{project.provider.completedProjects}</span> projects completed
                    </p>
                  </div>
                </div>
              </div>
              {project.provider.bio && (
                <p className="text-slate-500 text-xs mt-4 leading-relaxed border-t border-slate-100 pt-3">
                  {project.provider.bio}
                </p>
              )}
            </div>

            {/* Milestones */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 text-sm mb-5">
                Milestone breakdown — {project.milestones.length} milestones
              </h2>
              <div className="space-y-0">
                {project.milestones.map((m, i) => (
                  <div
                    key={m.id}
                    className={cn(
                      "relative flex items-start gap-4 py-4",
                      i < project.milestones.length - 1 && "border-b border-slate-100"
                    )}
                  >
                    {/* Step indicator */}
                    <div className="w-7 h-7 bg-forest-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{m.description}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <CheckCircle size={11} className="text-forest-500 flex-shrink-0" />
                        <p className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">Deliverable:</span> {m.deliverable}
                        </p>
                      </div>
                    </div>
                    <p className="font-display font-extrabold text-forest-900 text-lg tabular-nums flex-shrink-0">
                      {formatNaira(m.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How protection works */}
            <div className="card-muted p-5">
              <h3 className="font-semibold text-forest-900 text-sm mb-3 flex items-center gap-2">
                <Shield size={15} className="text-forest-600" /> How your payment is protected
              </h3>
              <div className="space-y-2.5">
                {[
                  { icon: Lock,       text: "Your payment is locked in a dedicated bank account — not sent to the provider." },
                  { icon: CheckCircle,text: "Payment releases only when you approve each milestone." },
                  { icon: Clock,      text: "If you don't respond in 72 hours, milestones auto-approve to protect the provider." },
                  { icon: AlertTriangle, text: "Raise a dispute any time — funds are frozen until our team reviews." },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex gap-2.5">
                    <Icon size={14} className="text-forest-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-forest-800 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — payment action */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20 shadow-md">
              <div className="text-center mb-5">
                <p className="font-display text-3xl font-extrabold text-slate-900 tabular-nums mb-1">
                  {formatNaira(project.totalAmount)}
                </p>
                <p className="text-xs text-slate-400">Total project value · {project.milestones.length} milestones</p>
              </div>

              {/* How payment works */}
              <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-forest-700 mb-2.5">How payment works</p>
                <div className="space-y-2">
                  {[
                    { icon: Building2, text: "You get a unique bank account number" },
                    { icon: Banknote,  text: "Transfer from any Nigerian bank" },
                    { icon: Lock,      text: "Funds locked until each milestone is approved" },
                    { icon: CheckCircle, text: "Free for clients — no hidden fees" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={12} className="text-forest-600 flex-shrink-0" />
                      <p className="text-xs text-forest-800">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Your project link</p>
                    <p className="text-xs text-slate-600 font-mono break-all mb-2">
                      milepay.ng/project/{project.id}
                    </p>
                    <button
                      onClick={async () => {
                        await copyToClipboard(`https://milepay.ng/project/${project.id}`);
                        setCopied(true);
                        toast.success("Link copied!");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={cn("btn-sm w-full justify-center gap-1.5",
                        copied ? "bg-forest-600 text-white" : "btn-outline"
                      )}
                    >
                      <Copy size={12} /> {copied ? "Copied!" : "Copy share link"}
                    </button>
                  </div>
                  <Link href={`/projects/${project.id}`} className="btn-ghost w-full justify-center gap-2 border border-slate-200">
                    Manage project <ChevronRight size={14} />
                  </Link>
                </div>
              ) : alreadyFunded ? (
                <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 text-center">
                  <CheckCircle size={20} className="text-forest-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-forest-900">Project funded</p>
                  <p className="text-xs text-forest-600 mt-1">This project is already active.</p>
                  {isAuthenticated && (
                    <Link href={`/project/${project.id}/manage`} className="btn-primary btn-sm w-full mt-3 justify-center">
                      Go to project
                    </Link>
                  )}
                </div>
              ) : project.state === "CANCELLED" ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <AlertTriangle size={18} className="text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-red-800">This project has been cancelled</p>
                </div>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="btn-primary w-full justify-center gap-2 py-3 text-sm"
                >
                  {accepting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <><Shield size={15} /> Accept & fund project — {formatNaira(project.totalAmount)}</>
                  )}
                </button>
              )}

              {!isOwner && !alreadyFunded && project.state !== "CANCELLED" && (
                <p className="text-xs text-slate-400 text-center mt-3">
                  Free for clients · Protected by Nomba infrastructure
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectPreviewSkeleton() {
  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container-wide max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {[200, 120, 300].map((h) => (
              <div key={h} className="card p-6">
                <div className={`skeleton rounded-lg`} style={{ height: h }} />
              </div>
            ))}
          </div>
          <div className="card p-6">
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Project not found</h2>
        <p className="text-slate-500 text-sm mb-5">
          This link may have expired or the project was cancelled.
          Contact the service provider for a new link.
        </p>
        <Link href="/" className="btn-primary gap-2 inline-flex">Back to MilePay</Link>
      </div>
    </div>
  );
}
