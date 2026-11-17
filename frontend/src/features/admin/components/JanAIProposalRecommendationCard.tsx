import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  RefreshCw,
  Info,
  Award,
} from "lucide-react";
import type { AdminProposalAIRecommendation } from "../types/adminProposalTypes";
import { formatRelativeTime } from "../../../utils/date";

export interface JanAIProposalRecommendationCardProps {
  recommendation: AdminProposalAIRecommendation | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  proposalCount: number;
}

export const JanAIProposalRecommendationCard: React.FC<
  JanAIProposalRecommendationCardProps
> = ({
  recommendation,
  loading,
  error,
  onRetry,
  isRetrying = false,
  proposalCount,
}) => {
  // Loading skeleton state
  if (loading) {
    return (
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-blue-100" />
            <div className="h-5 w-56 rounded bg-slate-200" />
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="h-16 rounded-lg bg-blue-50/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-28 rounded-lg bg-slate-100" />
          <div className="h-28 rounded-lg bg-slate-100" />
          <div className="h-28 rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  // Error state when recommendation could not be loaded
  if (error && !recommendation) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
            <h3>JanAI Proposal Recommendation</h3>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry Analysis</span>
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          JanAI proposal evaluation is currently unavailable. You can still review all submitted proposals below.
        </p>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (!recommendation || proposalCount === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-200/80 bg-white shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  JanAI Proposal Recommendation
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  AI Advisory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated {recommendation.analyzedProposalCount} submitted proposal
                {recommendation.analyzedProposalCount === 1 ? "" : "s"}
                {recommendation.analyzedAt && (
                  <span> &bull; {formatRelativeTime(recommendation.analyzedAt)}</span>
                )}
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              title="Regenerate proposal recommendation"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Refreshing..." : "Re-analyze"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Recommended Proposal Highlight */}
        {recommendation.recommendedProviderName ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                    Recommended Candidate
                  </span>
                  <span className="text-sm font-semibold text-emerald-950">
                    &bull; {recommendation.recommendedProviderName}
                  </span>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  {recommendation.recommendationReason}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {recommendation.recommendationReason}
          </div>
        )}

        {/* 3-Column Analysis Breakdown: Strengths, Concerns, Trade-offs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Strengths */}
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Key Strengths</span>
            </div>
            {recommendation.keyStrengths && recommendation.keyStrengths.length > 0 ? (
              <ul className="space-y-2">
                {recommendation.keyStrengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 mt-0.5 shrink-0">&bull;</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific strengths noted.</p>
            )}
          </div>

          {/* Key Concerns */}
          <div className="rounded-lg border border-amber-100 bg-amber-50/30 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Points for Review</span>
            </div>
            {recommendation.keyConcerns && recommendation.keyConcerns.length > 0 ? (
              <ul className="space-y-2">
                {recommendation.keyConcerns.map((con, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No major concerns identified.</p>
            )}
          </div>

          {/* Trade-Offs Considered */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-xs uppercase tracking-wider">
              <ArrowRightLeft className="h-4 w-4 text-blue-600" />
              <span>Comparative Trade-Offs</span>
            </div>
            {recommendation.tradeOffs && recommendation.tradeOffs.length > 0 ? (
              <ul className="space-y-2">
                {recommendation.tradeOffs.map((tro, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
                    <span>{tro}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">Direct comparison did not reveal trade-offs.</p>
            )}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-500">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Advisory Notice:</strong> JanAI recommendations are generated to assist administrative review and do not automatically approve, accept, or reject proposals. Final decision rests with the platform administrator.
          </span>
        </div>
      </div>
    </div>
  );
};

export default JanAIProposalRecommendationCard;

