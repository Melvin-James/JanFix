import React, { useState } from "react";
import {
  IndianRupee,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Heart,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../../store/authStore";
import type { IssueFundingSnapshot } from "../../types/issue";
import { DonateModal } from "../../../donations/components/DonateModal";

interface ProjectFundingSectionProps {
  snapshot?: IssueFundingSnapshot;
  issueId?: string;
  issueTitle?: string;
  issueStatus?: string;
  onDonationSuccess?: () => void;
}

export const ProjectFundingSection: React.FC<ProjectFundingSectionProps> = ({
  snapshot,
  issueId,
  issueTitle = "Community Issue",
  issueStatus,
  onDonationSuccess,
}) => {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

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
  const progressPercent =
    fundingTarget > 0
      ? Math.min(100, Math.round((amountRaised / fundingTarget) * 100))
      : 0;

  const isGoalReached = fundingTarget > 0 && amountRaised >= fundingTarget;
  const isFundraisingActive = issueStatus === "FUNDRAISING";

  const handleOpenDonate = () => {
    if (!user) {
      toast.error("Please sign in to make a community contribution.");
      return;
    }
    setIsDonateOpen(true);
  };

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
          <span>{isGoalReached ? "Goal Achieved" : isFundraisingActive ? "Fundraising Active" : "Funding Overview"}</span>
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

      {/* Community Donation Actions */}
      {isGoalReached ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>100% Funding Goal Achieved!</span>
          </div>
          <p className="text-xs text-emerald-800">
            Thank you to all community contributors! The required budget for this civic project has been fully funded.
          </p>
        </div>
      ) : isFundraisingActive ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-emerald-600 fill-emerald-100" />
              <span>Contribute to this Civic Resolution</span>
            </h4>
            <p className="text-xs text-emerald-800 max-w-md leading-relaxed">
              Every donation goes directly towards funding the selected provider&apos;s verified proposal. Powered by Stripe Test Mode.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenDonate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Contribute Now</span>
          </button>
        </div>
      ) : null}

      {/* Donate Modal */}
      {issueId && (
        <DonateModal
          issueId={issueId}
          issueTitle={issueTitle}
          fundingTargetRupees={fundingTarget}
          amountRaisedRupees={amountRaised}
          isOpen={isDonateOpen}
          onClose={() => setIsDonateOpen(false)}
          onSuccess={() => {
            onDonationSuccess?.();
          }}
        />
      )}
    </div>
  );
};
