"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, ArrowRight, Copy, CheckCircle, GripVertical } from "lucide-react";
import { createProjectSchema, type CreateProjectData } from "@/schemas";
import { projectApi } from "@/lib/api";
import { formatNaira, copyToClipboard, getProjectShareUrl, cn } from "@/lib/utils";

export default function CreateProjectPage() {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      milestones: [{ title: "", description: "", deliverable: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });
  const milestones = watch("milestones");
  const totalAmount = milestones?.reduce((sum, m) => sum + (Number(m.amount) || 0), 0) ?? 0;

  async function onSubmit(data: CreateProjectData) {
    try {
      const res = await projectApi.create({
        ...data,
        totalAmount,
        milestones: data.milestones.map((m) => ({ ...m, amount: Number(m.amount) })),
      });
      const project = res.data.data;
      setProjectId(project.id);
      setShareUrl(getProjectShareUrl(project.id));
      toast.success("Project created successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create project");
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  // Success state
  if (shareUrl && projectId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center shadow-md">
            <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-forest-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Project created!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Share this link with your client. They&apos;ll see the full milestone plan before accepting and paying.
            </p>

            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-forest-700 mb-2">Total project value</p>
              <p className="font-display text-3xl font-extrabold text-forest-900">{formatNaira(totalAmount)}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-600 truncate flex-1 font-mono">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className={cn("btn-sm flex-shrink-0 gap-1.5 transition-all",
                  copied ? "bg-forest-600 text-white" : "btn-outline"
                )}
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Share via WhatsApp, email, LinkedIn or any channel you communicate with your client.
            </p>

            <div className="flex gap-3">
              <Link href={`/projects/${projectId}`} className="btn-primary flex-1 justify-center gap-2">
                View project <ArrowRight size={15} />
              </Link>
              <button
                onClick={() => { setShareUrl(null); setProjectId(null); }}
                className="btn-outline flex-shrink-0"
              >
                New project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="container-wide flex items-center h-14 gap-4">
          <Link href="/dashboard" className="btn-ghost btn-sm gap-1.5">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-display font-bold text-slate-900">Create new project</h1>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Project details */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-slate-900 mb-5">Project details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="field-label">Project title <span className="text-red-500">*</span></label>
                    <input
                      {...register("title")}
                      className="field-input"
                      placeholder="e.g. Brand Identity Design Package"
                    />
                    {errors.title && <p className="field-error">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="field-label">Project description <span className="text-red-500">*</span></label>
                    <textarea
                      {...register("description")}
                      className="field-textarea"
                      rows={4}
                      placeholder="Describe the full scope of work, what's included, and what the client can expect…"
                    />
                    {errors.description && <p className="field-error">{errors.description.message}</p>}
                  </div>

                  <div>
                    <label className="field-label">
                      Client email <span className="text-slate-400 font-normal">(optional — to send them an invitation)</span>
                    </label>
                    <input
                      type="email"
                      {...register("clientEmail")}
                      className="field-input"
                      placeholder="client@example.com"
                    />
                    {errors.clientEmail && <p className="field-error">{errors.clientEmail.message}</p>}
                    <p className="field-hint">Leave blank to share the link manually via WhatsApp or any channel.</p>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display font-bold text-slate-900">Milestones</h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Break your project into deliverable stages. You get paid after each one is approved.
                    </p>
                  </div>
                  <span className="badge badge-slate">{fields.length}/10</span>
                </div>

                {errors.milestones?.root && (
                  <p className="field-error mb-4">{errors.milestones.root.message}</p>
                )}

                <div className="space-y-4">
                  {fields.map((field, i) => (
                    <div key={field.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                        <span className="w-6 h-6 bg-forest-900 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-700 text-sm flex-1">Milestone {i + 1}</span>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="field-label text-xs">Milestone title</label>
                          <input
                            {...register(`milestones.${i}.title`)}
                            className="field-input text-sm"
                            placeholder="e.g. Wireframes and mockups"
                          />
                          {errors.milestones?.[i]?.title && (
                            <p className="field-error">{errors.milestones[i]?.title?.message}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="field-label text-xs">Description</label>
                          <textarea
                            {...register(`milestones.${i}.description`)}
                            className="field-textarea text-sm min-h-[70px]"
                            rows={2}
                            placeholder="What does this milestone cover?"
                          />
                          {errors.milestones?.[i]?.description && (
                            <p className="field-error">{errors.milestones[i]?.description?.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="field-label text-xs">Deliverable</label>
                          <input
                            {...register(`milestones.${i}.deliverable`)}
                            className="field-input text-sm"
                            placeholder="e.g. 3 homepage mockups in Figma"
                          />
                          {errors.milestones?.[i]?.deliverable && (
                            <p className="field-error">{errors.milestones[i]?.deliverable?.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="field-label text-xs">Amount (₦)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₦</span>
                            <input
                              type="number"
                              {...register(`milestones.${i}.amount`, { valueAsNumber: true })}
                              className="field-input pl-7 text-sm"
                              placeholder="50000"
                              min={1000}
                            />
                          </div>
                          {errors.milestones?.[i]?.amount && (
                            <p className="field-error">{errors.milestones[i]?.amount?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {fields.length < 10 && (
                  <button
                    type="button"
                    onClick={() => append({ title: "", description: "", deliverable: "", amount: 0 })}
                    className="btn-ghost w-full mt-4 border border-dashed border-slate-300 gap-2 py-3 hover:border-forest-300 hover:text-forest-700"
                  >
                    <Plus size={15} /> Add milestone
                  </button>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center gap-2 py-3 text-base">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating project…
                  </span>
                ) : (
                  <>Create project & get share link <ArrowRight size={17} /></>
                )}
              </button>
            </form>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20">
              <h3 className="font-semibold text-slate-900 text-sm mb-4">Project summary</h3>
              <div className="space-y-3 mb-5">
                {milestones?.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="w-5 h-5 bg-forest-100 text-forest-700 rounded-full text-2xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-slate-600 truncate">{m.title || `Milestone ${i + 1}`}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums flex-shrink-0">
                      {m.amount ? formatNaira(Number(m.amount)) : "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Total project value</span>
                  <span className="font-display font-extrabold text-forest-900 text-lg tabular-nums">
                    {formatNaira(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Platform fee (2%)</span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    −{formatNaira(Math.round(totalAmount * 0.02))}
                  </span>
                </div>
                <div className="flex justify-between mt-1.5 border-t border-slate-100 pt-2">
                  <span className="text-xs font-semibold text-slate-700">You receive</span>
                  <span className="text-sm font-bold text-forest-700 tabular-nums">
                    {formatNaira(Math.round(totalAmount * 0.98))}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>2% fee</strong> is deducted per milestone released — not upfront.
                  You only pay when money arrives in your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
