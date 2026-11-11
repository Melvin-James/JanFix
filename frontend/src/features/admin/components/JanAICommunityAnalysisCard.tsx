import React, { useState } from "react";

import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";

import type { IssueAIAnalysis } from "../types/adminAITypes";

import { formatRelativeTime } from "../../../utils/date";

export interface JanAICommunityAnalysisCardProps {
  analysis: IssueAIAnalysis | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const JanAICommunityAnalysisCard: React.FC<JanAICommunityAnalysisCardProps> = ({
  analysis,
  loading,
  error,
  onRetry,
  isRetrying = false,
}) => {
  const [showCommentBreakdown, setShowCommentBreakdown] = useState(false);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-indigo-100" />
            <div className="h-5 w-48 rounded bg-slate-200" />
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
        </div>
        <div className="h-14 rounded-lg bg-slate-100" />
      </div>
    );
  }

  // Error state when analysis could not be fetched
  if (error && !analysis) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
            <h3>JanAI Community Analysis</h3>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry</span>
            </button>
          )}
        </div>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Pending / interaction ongoing state
  if (analysis.status === "PENDING" || !analysis.isEligibleForAnalysis) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-950 font-semibold">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
            <h3>JanAI Community Analysis</h3>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            Interaction Window Ongoing
          </span>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          {analysis.summary ||
            "The 24-hour community interaction window is currently active. JanAI will analyze community comments once the interaction period closes."}
        </p>
      </div>
    );
  }

  // Processing state
  if (analysis.status === "PROCESSING") {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-950 font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 animate-pulse" />
            <h3>JanAI Community Analysis</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 border border-indigo-200">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            <span>Analyzing Comments...</span>
          </span>
        </div>
        <p className="text-sm text-indigo-800">
          JanAI is currently evaluating community feedback posted during the interaction window. Please refresh in a few moments.
        </p>
      </div>
    );
  }

  // Failed state
  if (analysis.status === "FAILED") {
    return (
      <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
            <h3 className="text-lg">JanAI Community Analysis</h3>
          </div>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 border border-red-200">
            Analysis Failed
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {analysis.errorMessage || "The community comment analysis could not be completed at this time."}
        </p>
        {onRetry && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry JanAI Analysis</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Determine score guidance badge & text
  const isInsufficient = analysis.status === "INSUFFICIENT_DATA" || analysis.score === null;
  const score = analysis.score;

  let scoreInterpretation = "Insufficient community feedback to produce a score";
  let scoreBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
  let scoreTextColor = "text-slate-700";

  if (!isInsufficient && score !== null) {
    if (score > 50) {
      scoreInterpretation = "Community feedback leans toward supporting the report";
      scoreBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
      scoreTextColor = "text-emerald-700";
    } else if (score < 50) {
      scoreInterpretation = "Community feedback leans toward challenging the report";
      scoreBadgeColor = "bg-rose-50 text-rose-800 border-rose-200";
      scoreTextColor = "text-rose-700";
    } else {
      scoreInterpretation = "Mixed community feedback";
      scoreBadgeColor = "bg-blue-50 text-blue-800 border-blue-200";
      scoreTextColor = "text-blue-700";
    }
  }

  const overallClassificationLabel =
    analysis.overallClassification === "COMMUNITY_LEANING_SUPPORT"
      ? "Community Leaning: Support"
      : analysis.overallClassification === "COMMUNITY_LEANING_CHALLENGE"
      ? "Community Leaning: Challenge"
      : analysis.overallClassification === "MIXED_FEEDBACK"
      ? "Mixed Community Feedback"
      : "Insufficient Data";

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">JanAI Community Analysis</h3>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                Advisory
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluates community comments posted during the 24-hour interaction period.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${scoreBadgeColor}`}
          >
            {overallClassificationLabel}
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              title="Re-run JanAI analysis"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-3 w-3 text-slate-500 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Re-analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Support Score Card */}
        <div className="md:col-span-4 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Community Support Score
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              {isInsufficient ? (
                <span className="text-2xl font-bold text-slate-500">N/A</span>
              ) : (
                <>
                  <span className={`text-4xl font-extrabold tracking-tight ${scoreTextColor}`}>
                    {score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-600 leading-snug">
              {scoreInterpretation}
            </p>
          </div>

          {!isInsufficient && score !== null && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score > 50
                      ? "bg-emerald-500"
                      : score < 50
                      ? "bg-rose-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 (Disputed)</span>
                <span>50</span>
                <span>100 (Supported)</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Summary Card */}
        <div className="md:col-span-8 rounded-xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              <span>Advisory Feedback Summary</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>
              Eligible comments analyzed:{" "}
              <strong className="text-slate-700 font-semibold">
                {analysis.totalEligibleComments}
              </strong>
            </span>
            {analysis.completedAt && (
              <span>Analyzed {formatRelativeTime(analysis.completedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-100 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Supporting</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{analysis.supportCount}</p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
            <ThumbsDown className="h-3.5 w-3.5 text-rose-600" />
            <span>Challenging</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{analysis.challengeCount}</p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <MinusCircle className="h-3.5 w-3.5 text-slate-500" />
            <span>Neutral</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{analysis.neutralCount}</p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Total Evaluated</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {analysis.totalEligibleComments}
          </p>
        </div>
      </div>

      {/* Comment Classification List (Collapsible) */}
      {analysis.commentClassifications && analysis.commentClassifications.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowCommentBreakdown((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <span>
              {showCommentBreakdown
                ? "Hide individual comment classifications"
                : `View individual comment classifications (${analysis.commentClassifications.length})`}
            </span>
            {showCommentBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showCommentBreakdown && (
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
              {analysis.commentClassifications.map((item, index) => {
                const badgeStyle =
                  item.classification === "SUPPORTS_REPORT"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : item.classification === "CHALLENGES_REPORT"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-600 border-slate-200";

                return (
                  <div
                    key={item.commentId || index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${badgeStyle}`}
                      >
                        {item.classification}
                      </span>
                      {item.explanation && (
                        <span className="text-slate-600 italic">"{item.explanation}"</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {item.commentId.slice(-6)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Administrator Disclaimer */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <Shield className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> JanAI provides an advisory analysis of community comments. It does not verify the factual accuracy of an issue. The administrator makes the final decision.
        </p>
      </div>
    </div>
  );
};
export default JanAICommunityAnalysisCard;
