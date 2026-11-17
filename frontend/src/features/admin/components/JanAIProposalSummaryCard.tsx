import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  IndianRupee,
} from "lucide-react";
import type { AdminProposalAISummary } from "../types/adminProposalTypes";
import { formatRelativeTime } from "../../../utils/date";

export interface JanAIProposalSummaryCardProps {
  summary: AdminProposalAISummary | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const JanAIProposalSummaryCard: React.FC<JanAIProposalSummaryCardProps> = ({
  summary,
  loading,
  error,
  onRetry,
  isRetrying = false,
}) => {
  // Loading skeleton state
  if (loading) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-indigo-100" />
            <div className="h-5 w-48 rounded bg-slate-200" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-100" />
        </div>
        <div className="h-16 rounded-lg bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-24 rounded-lg bg-slate-100" />
          <div className="h-24 rounded-lg bg-slate-100" />
          <div className="h-24 rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !summary) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
            <h3>JanAI Proposal Assessment</h3>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry Assessment</span>
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          JanAI analysis for this proposal is currently unavailable. Full proposal details are visible below.
        </p>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-xl border border-indigo-200/80 bg-white shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/40 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  JanAI Proposal Assessment
                </h3>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                  AI Advisory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated qualitative synthesis
                {summary.analyzedAt && (
                  <span> &bull; {formatRelativeTime(summary.analyzedAt)}</span>
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
              title="Regenerate proposal assessment"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Refreshing..." : "Re-analyze"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Executive Summary */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Executive Summary
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed">
            {summary.executiveSummary}
          </p>
        </div>

        {/* 3 Core Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Solution Approach */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>Solution Approach</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.solutionApproach}
            </p>
          </div>

          {/* Workforce & Schedule */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="h-4 w-4" />
              <span>Workforce & Schedule</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.workforceAndScheduleAssessment}
            </p>
          </div>

          {/* Budget Assessment */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
              <IndianRupee className="h-4 w-4" />
              <span>Budget Assessment</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.budgetAssessment}
            </p>
          </div>
        </div>

        {/* Strengths, Concerns, Missing Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Strengths */}
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Strengths</span>
            </div>
            {summary.strengths && summary.strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 mt-0.5 shrink-0">&bull;</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">None noted.</p>
            )}
          </div>

          {/* Concerns */}
          <div className="rounded-lg border border-amber-100 bg-amber-50/30 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Potential Concerns</span>
            </div>
            {summary.potentialConcerns && summary.potentialConcerns.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.potentialConcerns.map((con, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">None noted.</p>
            )}
          </div>

          {/* Missing / Unclear Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Points for Clarification</span>
            </div>
            {summary.missingOrUnclearInfo && summary.missingOrUnclearInfo.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.missingOrUnclearInfo.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 mt-0.5 shrink-0">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">All essential details provided.</p>
            )}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-500">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Advisory Notice:</strong> JanAI assessments are generated using Gemini models to assist administrative review and do not constitute approval or rejection.
          </span>
        </div>
      </div>
    </div>
  );
};

export default JanAIProposalSummaryCard;

