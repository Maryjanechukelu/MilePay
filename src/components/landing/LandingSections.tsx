"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowRight, CheckCircle, Shield, Banknote, Clock, AlertTriangle,
  Zap, Star, ChevronDown, Lock, TrendingUp, Users, BarChart3,
  FileText, RefreshCw, Building2, Phone
} from "lucide-react";
import { HugeiconsIcon } from '@hugeicons/react';
import { FileAddIcon, SharedDriveIcon, WalletAdd01Icon, Payment02Icon, WorkUpdateIcon, ShapeCollectionIcon, IdVerifiedIcon, UserSwitchIcon, NewOfficeIcon, CheckmarkSquare02Icon, LockedIcon, ValidationApprovalIcon, TeamviewerIcon, MoneyLockIcon, ArrowRight02Icon, UserAiIcon} from '@hugeicons/core-free-icons'
import { formatNaira } from "@/lib/utils";

// ─── Fade-up animation helper ─────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STATS BAR
// ══════════════════════════════════════════════════════════════════
const stats = [
  { value: "4.2M+", label: "Nigerian freelancers & service providers" },
  { value: "67%", label: "have been paid late or not at all" },
  { value: "₦1.8T", label: "freelance economy with near-zero payment protection" },
];

export function StatsBar() {
  return (
    <section className="bg-slate-900 py-10">
      <div className="container-wide">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-slate-700">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div className="text-center sm:px-8">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-1 tabular-nums">
                  {s.value}
                </p>
                <p className="text-slate-400 text-sm leading-snug">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════════════
const providerSteps: {
  n: string;
  title: string;
  body: string;
  icon: (props: any) => JSX.Element;
}[] = [
    {
      n: "01",
      title: "Create your project",
      body: "Fill in your project details and break it into milestones - each with a clear deliverable and payment amount. Takes under 2 minutes.",
      icon: (props: any) => <HugeiconsIcon icon={FileAddIcon} {...props} />,
    },
    {
      n: "02",
      title: "Share the link",
      body: "Send your unique project link to your client via WhatsApp, email, or LinkedIn. They see the full milestone plan before committing.",
      icon: (props: any) => <HugeiconsIcon icon={SharedDriveIcon} {...props} />,
    },
    {
      n: "03",
      title: "Client funds the project",
      body: "Your client pays the full amount into a dedicated bank account created just for this project. Funds are locked - not sent to you yet.",
      icon: (props: any) => <HugeiconsIcon icon={WalletAdd01Icon} {...props} />,
    },
    {
      n: "04",
      title: "Get paid per milestone",
      body: "Submit each milestone. When your client approves, payment releases automatically. No chasing. No waiting. No faith required.",
      icon: (props: any) => <HugeiconsIcon icon={Payment02Icon} {...props} />,
    },
  ];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-py bg-cream">
      <div className="container-wide">
        <FadeUp className="text-center mb-16">
          <p className="label-sm mb-3">How it works</p>
          <h2 className="display-section text-slate-900 mb-4 text-balance">
            Money flows exactly as work flows
          </h2>
          <p className="body-lg max-w-xl mx-auto text-balance">
            Four steps that protect both sides of every service transaction.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providerSteps.map((step, i) => (
            <FadeUp key={step.n} delay={i * 0.1}>
              <div className="relative group">
                {/* Connector */}
                {i < providerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-6 h-px bg-slate-200 -translate-x-3 z-10" />
                )}
                <div className="card p-6 h-full hover:border-forest-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="font-display text-3xl font-black text-forest-100 leading-none select-none">
                      {step.n}
                    </span>
                    <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-forest-100 transition-colors">
                      <step.icon size={25} className="text-forest-700" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 mb-2 text-lg leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// FOR PROVIDERS
// ══════════════════════════════════════════════════════════════════
const providerBenefits = [
  {
    icon: (props: any) => <HugeiconsIcon icon={WorkUpdateIcon} {...props} />,
    title: "Stop working on faith",
    body: "Client funds the full project before you start. You know money is locked and protected before you open your laptop.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={ShapeCollectionIcon} {...props} />,
    title: "Improve your cash flow",
    body: "Get paid progressively as you deliver. No more waiting until the end to receive anything - earn as you go.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={IdVerifiedIcon} {...props} />,
    title: "Build a verified track record",
    body: "Every completed project builds your public reputation score. Clients can see your completion rate and verified ID before hiring.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={UserSwitchIcon} {...props} />,
    title: "Works for any service",
    body: "Developer, designer, tutor, consultant, photographer, content writer - if you deliver a service, MilePay protects your payment.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={NewOfficeIcon} {...props} />,
    title: "Look professional to enterprise clients",
    body: "Send a clean project agreement instead of a WhatsApp voice note. MilePay makes small providers look serious.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={CheckmarkSquare02Icon} {...props} />,
    title: "72-hour auto-approval",
    body: "If your client doesn't respond within 72 hours of delivery, the milestone is automatically approved and your payment releases.",
  },
];

export function ForProvidersSection() {
  return (
    <section id="for-providers" className="section-py bg-forest-900">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <FadeUp>
            <p className="label-sm text-forest-400 mb-3">For service providers</p>
            <h2 className="display-section text-white mb-5 text-balance">
              Your buyers are scared to pay you.
              <br />
              <span className="text-amber-400">Give them a reason to trust you.</span>
            </h2>
            <p className="text-forest-200 text-lg leading-relaxed mb-8 max-w-lg">
              The best Nigerian freelancers lose clients not because of poor work — but because
              clients have been burned before and won't pay upfront. MilePay removes that friction.
            </p>
            <Link href="/register?role=provider" className="btn-secondary btn-lg inline-flex items-center gap-2 sm:text-medium text-sm">
              Protect my next project <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
            </Link>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-4">
            {providerBenefits.map((b, i) => (
              <FadeUp key={b.title} delay={i * 0.07}>
                <div className="bg-forest-800/50 border border-forest-700/50 rounded-xl p-4 hover:border-forest-500/50 hover:bg-forest-800 transition-all duration-200">
                  <div className="w-9 h-9 bg-forest-700/60 rounded-lg flex items-center justify-center mb-3">
                    <b.icon size={25} className="text-amber-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1.5 leading-tight">{b.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{b.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// FOR CLIENTS
// ══════════════════════════════════════════════════════════════════
const clientBenefits = [
  {
    icon: (props: any) => <HugeiconsIcon icon={LockedIcon} {...props} />,
    title: "Pay once, control everything",
    body: "Fund the full project upfront. Your money is locked - the provider never touches it until you approve each milestone.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={ValidationApprovalIcon} {...props} />,
    title: "Approve only what's delivered",
    body: "Review each milestone before payment releases. Request revisions if needed. You're in control at every step.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={TeamviewerIcon} {...props} />,
    title: "Dispute protection",
    body: "If something goes wrong, raise a dispute. Funds are frozen while our team reviews evidence from both sides.",
  },
  {
    icon: (props: any) => <HugeiconsIcon icon={IdVerifiedIcon} {...props} />,
    title: "See verified track records",
    body: "Every provider's completion rate, past reviews, and ID verification status is visible before you commit.",
  },
];

export function ForClientsSection() {
  return (
    <section id="for-clients" className="section-py bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <FadeUp className="order-2 lg:order-1">
            <ClientProtectionVisual />
          </FadeUp>

          <FadeUp className="order-1 lg:order-2">
            <p className="label-sm mb-3">For clients</p>
            <h2 className="display-section text-slate-900 mb-5 text-balance">
              Your money is protected
              <br />
              <span className="gradient-text">until you say so.</span>
            </h2>
            <p className="body-lg mb-8 max-w-lg">
              No more paying ₦150,000 to a developer who disappears after week one.
              Every naira is locked until you approve the work. And if anything goes
              wrong, we have your back.
            </p>
            <div className="space-y-4 mb-8">
              {clientBenefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-9 h-9 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <b.icon size={25} className="text-forest-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{b.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/register?role=client" className="btn-primary btn-lg inline-flex items-center gap-2">
              Hire with confidence <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function ClientProtectionVisual() {
  return (
    <div className="max-w-sm mx-auto space-y-3">
      {/* Fund lock */}
      <div className="card p-5 border-forest-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
            <HugeiconsIcon icon={MoneyLockIcon} size={25} className="text-forest-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Funds locked</p>
            <p className="text-xs text-slate-500">Nomba virtual account</p>
          </div>
          <div className="ml-auto font-display font-extrabold text-forest-700 text-lg">
            ₦180,000
          </div>
        </div>
        <div className="bg-forest-50 rounded-lg p-3 text-xs text-forest-700 font-medium">
          Funds held securely - not released until you approve each milestone
        </div>
      </div>

      {/* Milestone approval */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Milestone 2 ready for review</p>
        <p className="text-sm text-slate-700 mb-4">
          <span className="font-semibold">Tunde</span> submitted the development milestone with 3 files attached.
        </p>
        <div className="flex gap-2">
          <button className="flex-1 btn-primary btn-sm text-center">
            ✓ Approve - release ₦70,560
          </button>
          <button className="btn-ghost btn-sm border border-slate-200">
            Request revision
          </button>
        </div>
      </div>

      {/* Protection badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <Shield size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800 font-medium">
          Funds never reach the provider until <strong>you</strong> approve. Raise a dispute anytime.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// VIRTUAL ACCOUNT SECTION
// ══════════════════════════════════════════════════════════════════
export function VirtualAccountSection() {
  return (
    <section className="section-py bg-slate-50">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <p className="label-sm mb-3">Powered by Nomba</p>
            <h2 className="display-section text-slate-900 mb-5">
              Your project gets
              <br />
              <span className="gradient-text">its own bank account.</span>
            </h2>
            <p className="body-lg mb-6 max-w-lg">
              Every MilePay project is backed by a dedicated Nomba virtual account -
              a real Nigerian bank account number that any bank in Nigeria can transfer to.
              No card details. No friction. Just the most familiar payment method in Nigeria.
            </p>
            <div className="space-y-3">
              {[
                "Transfer from any Nigerian bank - GTBank, Access, Zenith, FirstBank, OPay, Kuda",
                "Payments reconcile automatically - underpayment detected instantly",
                "Every naira is traceable - full audit trail per project",
                "Overpayments tracked and refundable at project close",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-forest-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-600 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <VirtualAccountVisual />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function VirtualAccountVisual() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="card p-6 shadow-lg border-slate-200">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 bg-forest-900 rounded flex items-center justify-center">
            <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
          </div>
          <span className="text-sm font-semibold text-slate-700">Project payment account</span>
        </div>

        <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-forest-600 font-medium mb-3">Send your project payment to:</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Bank</span>
              <span className="text-xs font-semibold text-slate-900">Nomba Microfinance Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Account number</span>
              <span className="text-xs font-semibold text-slate-900 font-mono tracking-wider">9015 2847 63</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Account name</span>
              <span className="text-xs font-semibold text-slate-900">MilePay / Brand Identity Project</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Amount</span>
              <span className="text-xs font-bold text-forest-700">₦180,000</span>
            </div>
          </div>
        </div>

        {/* Reconciliation status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-forest-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-600">Payment received</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-forest-500 rounded-full" />
              <span className="text-xs font-semibold text-forest-700">₦180,000 ✓</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-600">Project status</span>
            <span className="text-xs font-semibold text-amber-700">Active - work in progress</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Reconciled automatically via Nomba webhook
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PRICING
// ══════════════════════════════════════════════════════════════════
export function PricingSection() {
  return (
    <section id="pricing" className="section-py bg-cream">
      <div className="container-narrow">
        <FadeUp className="text-center mb-12">
          <p className="label-sm mb-3">Pricing</p>
          <h2 className="display-section text-slate-900 mb-4">
            Simple. Transparent. Fair.
          </h2>
          <p className="body-lg">
            MilePay is completely free for clients.
            Service providers only pay when they get paid.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Provider card */}
          <FadeUp>
            <div className="card-forest p-8 h-full">
              <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center mb-5">
                <HugeiconsIcon icon={IdVerifiedIcon} size={25} className="text-forest-400" />
              </div>
              <p className="text-forest-300 text-sm font-medium mb-1">For service providers</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-5xl font-extrabold text-white">2%</span>
                <span className="text-forest-300 text-sm">per milestone released</span>
              </div>
              <p className="text-forest-300 text-sm mb-6">
                On a ₦40,000 milestone, you receive ₦39,200. MilePay earns ₦800.
                You only pay when money actually hits your account.
              </p>
              <div className="space-y-2.5">
                {[
                  "No monthly subscription",
                  "No setup or listing fees",
                  "No charges on disputes or revisions",
                  "No charge if milestone is refunded",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-forest-400 flex-shrink-0" />
                    <span className="text-forest-200 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Client card */}
          <FadeUp delay={0.1}>
            <div className="card border-forest-200 p-8 h-full bg-forest-50">
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center mb-5">
                <HugeiconsIcon icon={NewOfficeIcon} size={25} className="text-forest-400" />
              </div>
              <p className="text-forest-700 text-sm font-medium mb-1">For clients</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-5xl font-extrabold text-forest-900">Free</span>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                Clients pay nothing to use MilePay. Review milestones, request revisions,
                and raise disputes - all at zero cost.
              </p>
              <div className="space-y-2.5">
                {[
                  "Free to accept any project",
                  "Free milestone reviews",
                  "Free revision requests",
                  "Free dispute submissions",
                  "Free project history access",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-forest-600 flex-shrink-0" />
                    <span className="text-slate-600 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Revenue callout */}
        {/* <FadeUp delay={0.2}>
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-900 text-sm font-medium">
              At ₦40,000 average milestone, MilePay earns ₦800 per milestone.
              An average project of 4 milestones generates ₦3,200 per project.
              <span className="font-bold"> At 1,000 projects a month: ₦3.2M MRR.</span>
            </p>
          </div>
        </FadeUp> */}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// SOCIAL PROOF
// ══════════════════════════════════════════════════════════════════
const stories = [
  {
    quote: "I delivered a full website redesign and the client just stopped responding. Three months of work, ₦180,000 gone. MilePay would have changed everything about that situation.",
    name: "Tunde A.",
    role: "Full-stack developer, Lagos",
    emoji: (props: any) => <HugeiconsIcon icon={UserAiIcon} {...props} />,
    highlight: "₦180,000 lost to ghosting",
  },
  {
    quote: "My IELTS student paid for 6 weeks, attended 3, then disputed the payment and got a refund from their bank. I needed proof the sessions happened. MilePay's milestone records would have been that proof.",
    name: "Mrs. Amaka O.",
    role: "IELTS tutor, Abuja",
    emoji: (props: any) => <HugeiconsIcon icon={UserAiIcon} {...props} />,
    highlight: "Dispute won with zero evidence",
  },
  {
    quote: "I hired a designer on Instagram. Beautiful portfolio. Paid ₦95,000 upfront. She delivered 30% of the work and went quiet. I had no contract, no recourse, nothing.",
    name: "Funmilayo B.",
    role: "SME owner, Lagos",
    emoji: (props: any) => <HugeiconsIcon icon={UserAiIcon} {...props} />,
    highlight: "₦95,000 paid, 30% delivered",
  },
];

export function SocialProofSection() {
  return (
    <section className="section-py bg-white">
      <div className="container-wide">
        <FadeUp className="text-center mb-12">
          <p className="label-sm mb-3">Why MilePay exists</p>
          <h2 className="display-section text-slate-900 mb-4">
            Real stories. Real losses. Fixed.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <FadeUp key={s.name} delay={i * 0.1}>
              <div className="card p-6 h-full flex flex-col">
                <div className="text-3xl mb-4 text-forest-600"><s.emoji size={36} /></div>
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 mb-4 inline-block w-fit">
                  {s.highlight}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5 italic">
                  &ldquo;{s.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                  <p className="text-slate-400 text-xs">{s.role}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════════════════════════
const faqs = [
  {
    q: "What if my client doesn't pay after accepting the project?",
    a: "If no payment is received within 7 days of the client accepting the project, the project is automatically cancelled and the link expires. You can create a new one at any time.",
  },
  {
    q: "How does the bank transfer payment work?",
    a: "When your client accepts the project, MilePay instantly provisions a dedicated Nomba virtual account — a real Nigerian bank account number. Your client transfers the full project amount to that account from any Nigerian bank. Payments reconcile automatically.",
  },
  {
    q: "What if my client sends less than the full amount?",
    a: "MilePay detects underpayments immediately. The project stays in 'Awaiting Payment' and your client is notified of the exact shortfall. Work only begins when the full amount is confirmed.",
  },
  {
    q: "What if there's a dispute on a milestone?",
    a: "Either party can raise a dispute on any milestone. Funds for that milestone are immediately frozen. Both sides submit evidence and a MilePay admin reviews within 48 business hours and makes a decision.",
  },
  {
    q: "How long does payout take after a milestone is approved?",
    a: "Payouts are processed within 1 business day. Express payout (instant) is available for an additional 0.5% fee. You'll receive an SMS and email confirmation once the transfer completes.",
  },
  {
    q: "What if the client doesn't respond after I submit a milestone?",
    a: "If your client takes no action within 72 hours of your submission, the milestone is automatically approved and payment is released. This protects you from ghosting without requiring any escalation.",
  },
  {
    q: "Is MilePay regulated?",
    a: "MilePay is built on Nomba's licensed financial infrastructure. Nomba is a CBN-licensed microfinance bank. All fund holding and transfers happen within this regulated environment.",
  },
  {
    q: "Can I use MilePay for services — not just physical products?",
    a: "Absolutely. MilePay is designed specifically for services — web development, design, tutoring, consulting, photography, writing, and more. Milestones are freeform so you define exactly what each one includes.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="section-py bg-slate-50">
      <div className="container-narrow">
        <FadeUp className="text-center mb-12">
          <p className="label-sm mb-3">Common questions</p>
          <h2 className="display-section text-slate-900 mb-4">
            Everything you need to know
          </h2>
        </FadeUp>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="card overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open === i ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// FINAL CTA
// ══════════════════════════════════════════════════════════════════
export function FinalCTASection() {
  return (
    <section className="section-py bg-forest-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-mesh opacity-40 pointer-events-none" />
      <div className="container-narrow relative z-10 text-center">
        <FadeUp>
          <p className="label-sm text-forest-400 mb-4">Ready to get paid fairly?</p>
          <h2 className="display-section text-white mb-5 text-balance">
            Stop working on faith.
            <br />
            <span className="text-amber-400">Start getting paid as you deliver.</span>
          </h2>
          <p className="text-forest-200 text-lg mb-10 max-w-lg mx-auto text-balance">
            Join Nigerian service providers who've stopped chasing clients
            and started building trust that pays - literally.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=provider"
              className="btn-secondary btn-lg inline-flex items-center justify-center gap-2 sm:text-medium text-sm"
            >
              I provide services - protect my work
              <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
            </Link>
            <Link
              href="/register?role=client"
              className="btn-outline btn-lg border-forest-400 text-forest-100 hover:bg-forest-800 inline-flex items-center justify-center gap-2 sm:text-medium text-sm"
            >
              I hire services - pay with confidence
            </Link>
          </div>

          <p className="text-forest-400 text-sm mt-6">
            Free to sign up · No credit card required · Takes under 3 minutes
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════════
export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12">
      <div className="container-wide">
        <div className="grid sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-forest-800 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-display font-extrabold text-xs">M</span>
              </div>
              <span className="font-display font-bold text-white">MilePay</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Milestone-based payment infrastructure for Nigerian service providers and their clients.
              Built on Nomba.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Product</p>
            <div className="space-y-2">
              {["How it works", "For providers", "For clients", "Pricing"].map((l) => (
                <p key={l}><Link href="#" className="text-sm hover:text-white transition-colors">{l}</Link></p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Company</p>
            <div className="space-y-2">
              {["About", "Blog", "Terms of service", "Privacy policy"].map((l) => (
                <p key={l}><Link href="#" className="text-sm hover:text-white transition-colors">{l}</Link></p>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 MilePay. All rights reserved.</p>
          <p className="text-xs">Powered by <span className="text-white font-medium">Nomba</span> financial infrastructure.</p>
        </div>
      </div>
    </footer>
  );
}
