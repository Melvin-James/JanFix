import React from "react";
import { IndianRupee, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import type { IssueFundingSnapshot } from "../../types/issue";

interface ProjectFundingSectionProps {
  snapshot?: IssueFundingSnapshot;
}

export const ProjectFundingSection: React.FC<ProjectFundingSectionProps> = ({
  snapshot,
}) => {
  if (!snapshot) return null;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (snapshot.fundingType === "NGO_OWN_FUNDING") {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-900 font-semibold text-base sm:text-lg">
          <HeartHandshake className="h-5 w-5 text-indigo-600 shrink-0" />
          <h2>NGO Self-Funded Project</h2>
        </div>
        <p className="text-xs sm:text-sm text-indigo-800 leading-relaxed max-w-2xl">
          This civic initiative is completely sponsored and executed by the selected non-governmental organization. No community fundraising campaigns or platform fee deductions are required for this project.
        </p>
      </div>
    );
  }

  const fundingTarget = snapshot.fundingTargetRupees || 0;
  const amountRaised = snapshot.amountRaisedRupees || 0;
  const progressPercent = fundingTarget > 0 ? Math.min(100, Math.round((amountRaised / fundingTarget) * 100)) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            <h2>Community Project Funding</h2>
          </div>
          <p className="text-xs text-slate-500">
            Transparent civic crowdfunding powered by community contributions.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Fundraising Active</span>
        </div>
      </div>

      {/* Progress & Target Stats */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-slate-600">
            Raised: <strong className="text-slate-900 font-bold">{formatINR(amountRaised)}</strong>
          </span>
          <span className="text-xs text-slate-500">
            Target: <strong className="text-slate-900 font-bold">{formatINR(fundingTarget)}</strong> ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5% Platform Fee Transparency Breakdown */}
      <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Transparent Financial Breakdown</span>
        </div>

        <div className="space-y-1.5 divide-y divide-slate-200/60 pt-1 text-slate-600">
          <div className="flex justify-between pt-1">
            <span>Provider Direct Execution Budget:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatINR(snapshot.providerBudgetRupees)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5">
            <span>JanFix Civic Platform & Verification Fee (5%):</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatINR(snapshot.platformFeeRupees)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 font-bold text-slate-900 text-sm">
            <span>Total Community Funding Goal:</span>
            <span className="text-emerald-700 font-mono">
              {formatINR(fundingTarget)}
            </span>
          </div>
        </div>
      </div>

      {/* Online Stripe Payment Disclaimer */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800 leading-relaxed">
        <p>
          <strong className="font-semibold">Note:</strong> Online card contributions via Stripe will be available in the upcoming release. Community pledges and donations for this project are currently being organized at scheduled civic ward meetups.
        </p>
      </div>
    </div>
  );
};

