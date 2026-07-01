"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Star, CheckCircle, MapPin, ExternalLink,
  Briefcase, Shield, ArrowRight
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { api } from "@/lib/api";
import { CATEGORY_LABELS, CATEGORY_ICONS, formatNaira } from "@/lib/utils";
import type { ProviderProfile } from "@/types";

interface PublicProfile {
  id: string;
  profile: ProviderProfile;
}

export default function PublicProfilePage() {
  const params = useParams();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/providers/${params.slug}`)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Profile not found"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-semibold text-slate-700 mb-3">Provider not found</p>
        <Link href="/" className="btn-primary btn-sm">Back to MilePay</Link>
      </div>
    </div>
  );

  const p = data.profile;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-full h-12 bg-forest-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-forest-800 transition-colors">
              <Image src="/bg-colored.png" alt="MilePay" width={120} height={50} />
            </div>
          </Link>
          <Link href="/register?role=client" className="btn-primary btn-sm gap-2">
            Hire this provider <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      <div className="container-wide py-10">
        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">

          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              {/* Avatar */}
              <div className="w-20 h-20 bg-forest-800 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4">
                {p.displayName?.charAt(0) ?? "P"}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-xl font-bold text-slate-900">{p.displayName}</h1>
                {p.idVerified && (
                  <span className="badge badge-green text-2xs gap-1">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>

              {p.city && (
                <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
                  <MapPin size={11} /> {p.city}, {p.state}
                </p>
              )}

              {/* Trust score */}
              <div className="flex items-center gap-3 mb-4 py-3 border-y border-slate-100">
                <div className="text-center">
                  <p className="font-display font-extrabold text-xl text-slate-900">{p.trustScore}</p>
                  <p className="text-2xs text-slate-400 flex items-center gap-0.5">
                    <Star size={9} className="text-amber-500 fill-current" /> Trust score
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="font-display font-extrabold text-xl text-slate-900">{p.completedProjects}</p>
                  <p className="text-2xs text-slate-400">Projects done</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="font-display font-extrabold text-xl text-slate-900">
                    {formatNaira(p.totalEarned, { compact: true })}
                  </p>
                  <p className="text-2xs text-slate-400">Earned</p>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.categories?.map((c) => {
                  const icon = CATEGORY_ICONS[c];
                  return (
                    <span key={c} className="badge badge-slate text-2xs gap-1">
                      <span><HugeiconsIcon icon={icon} size={12} /></span>
                      {CATEGORY_LABELS[c]}
                    </span>
                  );
                })}
              </div>

              {p.portfolioUrl && (
                <a
                  href={p.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost btn-sm w-full justify-center gap-1.5 border border-slate-200 mb-3"
                >
                  <ExternalLink size={13} /> View portfolio
                </a>
              )}

              <Link href={`/register?role=client`} className="btn-primary w-full justify-center gap-2">
                <Briefcase size={15} /> Hire {p.displayName?.split(" ")[0] ?? "this provider"}
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 text-sm mb-3">About</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{p.bio}</p>
            </div>

            {/* How MilePay works with this provider */}
            <div className="card-muted p-6">
              <h2 className="font-semibold text-forest-900 text-sm mb-3 flex items-center gap-2">
                <Shield size={15} className="text-forest-600" /> How working with {p.displayName?.split(" ")[0]} via MilePay works
              </h2>
              <div className="space-y-3">
                {[
                  `You review ${p.displayName?.split(" ")[0]}'s project proposal and milestone plan before committing.`,
                  "You fund the project once via bank transfer to a dedicated virtual account.",
                  "Funds are locked - not released until you approve each milestone.",
                  "If anything isn't right, you can request revisions or raise a dispute.",
                ].map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 bg-forest-900 text-white rounded-full text-2xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-forest-800 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="card p-6 text-center">
              <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                Ready to work with {p.displayName?.split(" ")[0]}?
              </h3>
              <p className="text-slate-500 text-sm mb-5">
                Create a free client account. MilePay protects your payment from day one.
              </p>
              <Link href="/register?role=client" className="btn-primary btn-lg inline-flex items-center gap-2">
                Get started - it&apos;s free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
