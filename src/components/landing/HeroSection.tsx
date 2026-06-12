"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle, Lock, Banknote } from "lucide-react";

const milestones = [
  { label: "Wireframes", amount: "₦40,000", state: "paid" },
  { label: "Development", amount: "₦80,000", state: "active" },
  { label: "Final handover", amount: "₦60,000", state: "locked" },
];

const stateStyles = {
  paid:   { bar: "bg-forest-600", text: "text-forest-700", badge: "bg-forest-50 text-forest-700 border-forest-200", label: "Paid" },
  active: { bar: "bg-amber-500",  text: "text-amber-700",  badge: "bg-amber-50 text-amber-800 border-amber-200",   label: "In progress" },
  locked: { bar: "bg-slate-200",  text: "text-slate-400",  badge: "bg-slate-50 text-slate-400 border-slate-200",   label: "Locked" },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-forest-900 pt-16">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-hero-mesh opacity-60 pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-wide relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-forest-800/60 border border-forest-600/40 text-forest-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            >
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse-dot" />
              Built for Nigerian service providers
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="display-hero text-white mb-6"
            >
              Get paid
              <br />
              <span className="text-amber-400">as you</span>
              <br />
              deliver.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-forest-200 text-lg leading-relaxed max-w-lg mb-8"
            >
              MilePay holds your project funds securely and releases payment
              automatically as each milestone is approved. No more ghosting.
              No more sending ₦150,000 to a stranger and hoping for the best.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link
                href="/register?role=provider"
                className="btn-secondary btn-lg inline-flex items-center justify-center gap-2 sm:text-medium text-sm"
              >
                Protect my next project
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/register?role=client"
                className="btn-outline btn-lg border-forest-400 text-forest-100 hover:bg-forest-800 inline-flex items-center justify-center gap-2 sm:text-medium text-sm"
              >
                Hire with confidence
              </Link>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Shield,      text: "Funds protected" },
                { icon: CheckCircle, text: "Free for clients" },
                { icon: Lock,        text: "Nomba-powered" },
                { icon: Banknote,    text: "Bank transfer payments" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-forest-300 text-xs font-medium"
                >
                  <Icon size={13} className="text-forest-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — milestone waterfall animation */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:block"
          >
            <MilestoneWaterfall />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
}

function MilestoneWaterfall() {
  return (
    <div className="relative max-w-sm mx-auto">
      {/* Project card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-300 font-medium mb-1">Brand Identity Project</p>
            <p className="text-white font-display font-bold text-xl">₦180,000</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            Active
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "33%" }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-forest-400 to-amber-400 rounded-full"
          />
        </div>
        <p className="text-forest-400 text-xs mt-1.5">1 of 3 milestones completed</p>
      </motion.div>

      {/* Waterfall connector */}
      <div className="flex justify-center mb-2">
        <div className="w-px h-6 bg-gradient-to-b from-white/20 to-amber-400/60" />
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {milestones.map((m, i) => {
          const cfg = stateStyles[m.state as keyof typeof stateStyles];
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
              className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 flex items-center gap-4"
            >
              {/* State indicator */}
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.bar}`} />

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{m.label}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white/80 text-sm font-display font-bold tabular-nums">
                  {m.amount}
                </span>
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Connector line */}
              {i < milestones.length - 1 && (
                <div className="absolute -bottom-3.5 left-[22px] w-px h-3.5 bg-white/15" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment release notification */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
        className="mt-5 bg-forest-600/40 border border-forest-400/40 rounded-xl p-3.5 flex items-center gap-3"
      >
        <div className="w-8 h-8 bg-forest-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Banknote size={16} className="text-amber-300" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Milestone 1 approved</p>
          <p className="text-gray-400 text-xs">₦39,200 released to Tunde ✓</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-forest-400 rounded-full animate-pulse-dot" />
      </motion.div>

      {/* Floating label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-2xs font-bold px-2.5 py-1.5 rounded-full shadow-lg rotate-12"
      >
        2% platform fee
      </motion.div>
    </div>
  );
}
