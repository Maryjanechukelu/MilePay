"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  CheckCircle, Clock, Lock, AlertTriangle, Upload, ChevronLeft,
  ArrowRight, RefreshCw, FileText, MessageSquare, Banknote,
  Shield, Copy, RotateCcw, X
} from "lucide-react";
import { projectApi, milestoneApi, uploadApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  formatNaira, formatDateTime, relativeTime, copyToClipboard,
  PROJECT_STATE_CONFIG, MILESTONE_STATE_CONFIG, getMilestoneProgress,
  calculateFee, hoursUntil, cn, getProjectShareUrl
} from "@/lib/utils";
import type { Project, Milestone } from "@/types";

export default function ProjectManagePage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{
    type: "submit" | "approve" | "revision" | "dispute";
    milestoneId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const isProvider = user?.role === "provider";
  const isClient   = user?.role === "client";

  async function loadProject() {
    try {
      const res = await projectApi.get(params.id as string);
      setProject(res.data.data);
    } catch {
      toast.error("Could not load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProject(); }, [params.id]);

  async function handleCopyLink() {
    const shareUrl = getProjectShareUrl(params.id as string);
    await copyToClipboard(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <ProjectSkeleton />;
  if (!project)  return <div className="min-h-screen bg-cream flex items-center justify-center"><p className="text-slate-500">Project not found</p></div>;

  const stateCfg  = PROJECT_STATE_CONFIG[project.state];
  const progress  = getMilestoneProgress(project.milestones);
  const pendingMs = project.milestones.filter((m) => m.state === "SUBMITTED");
  const activeM   = project.milestones.find((m) => m.state === "IN_PROGRESS");

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="container-wide flex items-center h-14 gap-4">
          <Link href={isProvider ? "/dashboard" : "/client-dashboard"} className="btn-ghost btn-sm gap-1.5">
            <ChevronLeft size={15} />
            {isProvider ? "Dashboard" : "My projects"}
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-display font-bold text-slate-900 text-sm truncate flex-1">{project.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`badge ${stateCfg.badgeClass} hidden sm:inline-flex`}>{stateCfg.label}</span>
            {isProvider && (
              <button
                onClick={handleCopyLink}
                className={cn("btn-sm gap-1.5", copied ? "bg-forest-600 text-white" : "btn-outline")}
              >
                <Copy size={12} /> {copied ? "Copied!" : "Share link"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container-wide py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Project header card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 mb-1">{project.title}</h2>
                  <p className="text-slate-500 text-xs">
                    {isProvider
                      ? `Client: ${project.client?.fullName ?? "Pending"}`
                      : `Provider: ${project.provider?.displayName}`}
                    · Created {relativeTime(project.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-extrabold text-2xl text-slate-900 tabular-nums">
                    {formatNaira(project.totalAmount)}
                  </p>
                  <p className="text-xs text-slate-400">{project.milestones.length} milestones</p>
                </div>
              </div>

              {project.description && (
                <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {project.description}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{progress.completed} of {progress.total} milestones completed</span>
                  <span className="font-semibold text-forest-700">{progress.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forest-600 to-forest-400 rounded-full transition-all duration-700"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action needed banner */}
            {isClient && pendingMs.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    {pendingMs.length} milestone{pendingMs.length > 1 ? "s" : ""} ready for your review
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Review and approve to release payment. Auto-approves after 72 hours if no action.
                  </p>
                </div>
              </div>
            )}

            {isProvider && activeM && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <ArrowRight size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Active milestone: {activeM.title}</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Complete this milestone and submit your deliverable when ready.
                  </p>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 text-sm mb-5">Milestones</h3>
              <div className="space-y-4">
                {project.milestones.map((m, i) => (
                  <MilestoneRow
                    key={m.id}
                    milestone={m}
                    index={i}
                    isProvider={isProvider}
                    isClient={isClient}
                    projectId={project.id}
                    onAction={(type) => setActiveModal({ type, milestoneId: m.id })}
                    onRefresh={loadProject}
                  />
                ))}
              </div>
            </div>

            {/* Audit log */}
            {project.auditLog && project.auditLog.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">Activity log</h3>
                <div className="space-y-3">
                  {project.auditLog.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-forest-400 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-700">{event.description}</p>
                        <p className="text-2xs text-slate-400 mt-0.5">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Payment summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Banknote size={15} className="text-forest-600" />
                {isProvider ? "Your earnings" : "Payment breakdown"}
              </h3>
              <div className="space-y-2.5">
                {project.milestones.map((m) => {
                  const { providerReceives } = calculateFee(m.amount);
                  return (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                          m.state === "PAID" ? "bg-forest-500" :
                          m.state === "APPROVED" || m.state === "APPROVED_PENDING_TRANSFER" ? "bg-amber-500" :
                          "bg-slate-200"
                        )} />
                        <span className="text-xs text-slate-600 truncate">{m.title}</span>
                      </div>
                      <span className={cn("text-xs font-semibold tabular-nums flex-shrink-0",
                        m.state === "PAID" ? "text-forest-700" : "text-slate-500"
                      )}>
                        {isProvider ? formatNaira(providerReceives) : formatNaira(m.amount)}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-slate-100 pt-2.5 mt-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {isProvider ? "You receive total" : "Total project value"}
                    </span>
                    <span className="text-sm font-extrabold font-display text-forest-900 tabular-nums">
                      {isProvider
                        ? formatNaira(Math.round(project.totalAmount * 0.98))
                        : formatNaira(project.totalAmount)}
                    </span>
                  </div>
                  {isProvider && (
                    <p className="text-2xs text-slate-400 text-right mt-0.5">after 2% platform fee</p>
                  )}
                </div>
              </div>
            </div>

            {/* Virtual account (client view) */}
            {isClient && project.virtualAccount && (
              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Shield size={15} className="text-forest-600" /> Your funds
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Locked in escrow</span>
                    <span className="text-xs font-bold text-forest-700 tabular-nums">
                      {formatNaira(project.virtualAccount.balance)}
                    </span>
                  </div>
                  {project.virtualAccount.overpayment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Overpayment held</span>
                      <span className="text-xs font-semibold text-amber-700 tabular-nums">
                        {formatNaira(project.virtualAccount.overpayment)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project state info */}
            {project.state === "PENDING_PAYMENT" && isClient && (
              <div className="card p-5 border-amber-200 bg-amber-50">
                <p className="text-sm font-semibold text-amber-900 mb-2">Payment pending</p>
                <p className="text-xs text-amber-700 mb-3">
                  Send your payment to the virtual account to activate this project.
                </p>
                <Link href={`/project/${project.id}/pay`} className="btn-secondary btn-sm w-full justify-center gap-2">
                  View payment details <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action modals */}
      {activeModal && (
        <ActionModal
          type={activeModal.type}
          milestone={project.milestones.find((m) => m.id === activeModal.milestoneId)!}
          projectId={project.id}
          onClose={() => setActiveModal(null)}
          onSuccess={() => { setActiveModal(null); loadProject(); }}
        />
      )}
    </div>
  );
}

// ─── Milestone Row ────────────────────────────────────────────────
function MilestoneRow({
  milestone: m,
  index,
  isProvider,
  isClient,
  projectId,
  onAction,
  onRefresh,
}: {
  milestone: Milestone;
  index: number;
  isProvider: boolean;
  isClient: boolean;
  projectId: string;
  onAction: (type: "submit" | "approve" | "revision" | "dispute") => void;
  onRefresh: () => void;
}) {
  const stateCfg = MILESTONE_STATE_CONFIG[m.state];
  const { providerReceives, fee } = calculateFee(m.amount);
  const autoApproveIn = m.autoApproveAt ? hoursUntil(m.autoApproveAt) : null;
  const isLocked = m.state === "LOCKED";

  return (
    <div className={cn(
      "border rounded-2xl p-4 transition-all duration-200",
      isLocked ? "border-slate-100 bg-slate-50/50 opacity-60" :
      m.state === "SUBMITTED" ? "border-amber-200 bg-amber-50/40" :
      m.state === "PAID" ? "border-forest-200 bg-forest-50/30" :
      m.state === "DISPUTED" ? "border-red-200 bg-red-50/30" :
      "border-slate-200 bg-white"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* State icon */}
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            m.state === "PAID" ? "bg-forest-600" :
            m.state === "SUBMITTED" ? "bg-amber-500" :
            m.state === "IN_PROGRESS" ? "bg-blue-500" :
            m.state === "DISPUTED" ? "bg-red-500" :
            "bg-slate-200"
          )}>
            {m.state === "PAID" ? <CheckCircle size={14} className="text-white" /> :
             m.state === "SUBMITTED" ? <Clock size={14} className="text-white" /> :
             m.state === "IN_PROGRESS" ? <ArrowRight size={14} className="text-white" /> :
             m.state === "LOCKED" ? <Lock size={12} className="text-slate-400" /> :
             m.state === "DISPUTED" ? <AlertTriangle size={13} className="text-white" /> :
             <span className="text-xs font-bold text-slate-500">{index + 1}</span>}
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold text-sm", isLocked ? "text-slate-400" : "text-slate-900")}>
              {m.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-extrabold text-slate-900 tabular-nums">
            {formatNaira(m.amount)}
          </p>
          {isProvider && m.state !== "LOCKED" && (
            <p className="text-2xs text-slate-400 tabular-nums">
              You get {formatNaira(providerReceives)}
            </p>
          )}
        </div>
      </div>

      {/* Deliverable */}
      <div className="flex items-start gap-2 mb-3">
        <CheckCircle size={12} className="text-forest-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Deliverable:</span> {m.deliverable}
        </p>
      </div>

      {/* Badge + meta */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`badge text-2xs ${stateCfg.badgeClass}`}>{stateCfg.label}</span>

        {/* Auto-approve countdown */}
        {m.state === "SUBMITTED" && autoApproveIn !== null && autoApproveIn > 0 && (
          <p className="text-2xs text-amber-600 flex items-center gap-1">
            <Clock size={10} /> Auto-approves in ~{autoApproveIn}h
          </p>
        )}
        {m.state === "PAID" && m.paidAt && (
          <p className="text-2xs text-slate-400">Paid {relativeTime(m.paidAt)}</p>
        )}
      </div>

      {/* Delivery note */}
      {m.deliveryNote && m.state !== "IN_PROGRESS" && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-2xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <FileText size={10} /> Provider delivery note
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">{m.deliveryNote}</p>
        </div>
      )}

      {/* Revision note */}
      {m.state === "REVISION_REQUESTED" && m.revisionNotes && m.revisionNotes.length > 0 && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-2xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <MessageSquare size={10} /> Revision requested
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            {m.revisionNotes[m.revisionNotes.length - 1].content}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Provider actions */}
        {isProvider && m.state === "IN_PROGRESS" && (
          <button onClick={() => onAction("submit")} className="btn-primary btn-sm gap-1.5">
            <Upload size={13} /> Submit milestone
          </button>
        )}
        {isProvider && m.state === "REVISION_REQUESTED" && (
          <button onClick={() => onAction("submit")} className="btn-secondary btn-sm gap-1.5">
            <RefreshCw size={13} /> Resubmit revised work
          </button>
        )}
        {isProvider && m.state === "APPROVED_PENDING_TRANSFER" && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <RefreshCw size={12} className="animate-spin" />
            Payout processing…
          </div>
        )}

        {/* Client actions */}
        {isClient && m.state === "SUBMITTED" && (
          <>
            <button onClick={() => onAction("approve")}
              className="btn-primary btn-sm gap-1.5 bg-forest-600 hover:bg-forest-700">
              <CheckCircle size={13} /> Approve — release {formatNaira(providerReceives)}
            </button>
            <button onClick={() => onAction("revision")} className="btn-ghost btn-sm gap-1.5 border border-slate-200">
              <RotateCcw size={13} /> Request revision
            </button>
            <button onClick={() => onAction("dispute")} className="btn-ghost btn-sm gap-1.5 border border-red-200 text-red-600 hover:bg-red-50">
              <AlertTriangle size={13} /> Dispute
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Action Modals ────────────────────────────────────────────────
function ActionModal({
  type,
  milestone,
  projectId,
  onClose,
  onSuccess,
}: {
  type: "submit" | "approve" | "revision" | "dispute";
  milestone: Milestone;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [reason, setReason] = useState("");

  const onDrop = useCallback((f: File[]) => setFiles((prev) => [...prev, ...f].slice(0, 5)), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  });

  const { providerReceives } = calculateFee(milestone.amount);

  const titles = {
    submit:   "Submit milestone",
    approve:  "Approve milestone",
    revision: "Request revision",
    dispute:  "Raise a dispute",
  };

  async function handleSubmit() {
    setLoading(true);
    try {
      if (type === "submit") {
        if (text.length < 50) { toast.error("Delivery note must be at least 50 characters"); setLoading(false); return; }
        const deliveryFiles = files.length ? await uploadApi.uploadFiles(files) : undefined;
        await milestoneApi.submit(projectId, milestone.id, { deliveryNote: text, deliveryFiles });
        toast.success("Milestone submitted! Your client has been notified.");
      } else if (type === "approve") {
        await milestoneApi.approve(projectId, milestone.id);
        toast.success(`Approved! ${formatNaira(providerReceives)} will be released to the provider.`);
      } else if (type === "revision") {
        if (text.length < 20) { toast.error("Describe what needs revision (min 20 chars)"); setLoading(false); return; }
        await milestoneApi.requestRevision(projectId, milestone.id, text);
        toast.success("Revision requested. Provider has been notified.");
      } else if (type === "dispute") {
        if (!reason) { toast.error("Select a reason for the dispute"); setLoading(false); return; }
        if (text.length < 50) { toast.error("Describe the issue (min 50 chars)"); setLoading(false); return; }
        const evidenceFiles = files.length ? await uploadApi.uploadFiles(files) : undefined;
        await milestoneApi.dispute(projectId, milestone.id, { reason, description: text, evidenceFiles });
        toast.success("Dispute raised. Funds are frozen. We'll review within 48 hours.");
      }
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">{titles[type]}</h3>
          <button onClick={onClose} className="btn-ghost btn-icon"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Milestone info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-900 text-sm">{milestone.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
            <p className="font-display font-extrabold text-forest-900 text-lg mt-1 tabular-nums">
              {formatNaira(milestone.amount)}
            </p>
          </div>

          {/* Approve confirmation */}
          {type === "approve" && (
            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
              <div className="flex gap-2.5">
                <CheckCircle size={16} className="text-forest-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-forest-900">Confirm approval</p>
                  <p className="text-xs text-forest-700 mt-1 leading-relaxed">
                    Approving this milestone will release <strong>{formatNaira(providerReceives)}</strong> to the provider.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submission form */}
          {(type === "submit" || type === "revision" || type === "dispute") && (
            <>
              {type === "dispute" && (
                <div>
                  <label className="field-label">Reason for dispute</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="field-select">
                    <option value="">Select a reason</option>
                    <option value="work_not_delivered">Work not delivered</option>
                    <option value="poor_quality">Poor quality</option>
                    <option value="not_as_described">Not as described</option>
                    <option value="incomplete_delivery">Incomplete delivery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="field-label">
                  {type === "submit" ? "Delivery note" :
                   type === "revision" ? "What needs to be revised?" :
                   "Describe the issue"}
                </label>
                <textarea
                  className="field-textarea"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    type === "submit"
                      ? "Describe what you delivered, how to access it, any notes for the client… (min 50 chars)"
                      : type === "revision"
                      ? "Specifically describe what needs to change… (min 20 chars)"
                      : "Describe the issue in detail with specific examples… (min 50 chars)"
                  }
                />
                <p className={cn("text-2xs mt-1", text.length < (type === "revision" ? 20 : 50) ? "text-slate-400" : "text-forest-600")}>
                  {text.length} / {type === "revision" ? "20" : "50"} min characters
                </p>
              </div>

              {/* File upload */}
              <div>
                <label className="field-label">
                  {type === "submit" ? "Attach files" : "Upload evidence"}
                  <span className="text-slate-400 font-normal ml-1">(optional, max 5 files)</span>
                </label>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-forest-400 bg-forest-50" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload size={18} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Drop files here or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">Images, PDFs, documents · max 10MB each · max 5 files</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-700 truncate">{f.name}</span>
                        <button onClick={() => setFiles(files.filter((_, fi) => fi !== i))} className="text-slate-400 hover:text-red-500 ml-2">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dispute warning */}
          {type === "dispute" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">
                Raising a dispute will freeze the funds for this milestone. Both parties will be asked to submit evidence. MilePay admin will review within 48 business hours.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="btn-ghost flex-shrink-0">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={cn("flex-1 justify-center gap-2 py-2.5 disabled:opacity-50",
              type === "dispute" ? "btn-danger" :
              type === "approve" ? "btn-primary bg-forest-600 hover:bg-forest-700" :
              "btn-primary"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>
                {type === "submit" && <><Upload size={15} /> Submit milestone</>}
                {type === "approve" && <><CheckCircle size={15} /> Approve & release payment</>}
                {type === "revision" && <><RotateCcw size={15} /> Send revision request</>}
                {type === "dispute" && <><AlertTriangle size={15} /> Raise dispute</>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-slate-100 h-14" />
      <div className="container-wide py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {[200, 300, 400].map((h) => (
              <div key={h} className="card p-6">
                <div className="skeleton rounded-xl" style={{ height: h }} />
              </div>
            ))}
          </div>
          <div className="space-y-5">
            {[180, 120].map((h) => (
              <div key={h} className="card p-5">
                <div className="skeleton rounded-xl" style={{ height: h }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}