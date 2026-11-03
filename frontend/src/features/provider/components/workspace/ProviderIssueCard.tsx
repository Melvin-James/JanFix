import React, { useState } from "react";
import { MapPin, Clock, AlertCircle, CheckCircle2, HandHeart, RefreshCw } from "lucide-react";
import type { ProviderIssue } from "../../types/providerTypes";
import { StatusBadge } from "../../../../components/UI/StatusBadge";
import { formatRelativeTime } from "../../../../utils/date";

export interface ProviderIssueCardProps {
  issue: ProviderIssue;
  onExpressInterest: (issueId: string) => Promise<boolean>;
  className?: string;
}

export const ProviderIssueCard: React.FC<ProviderIssueCardProps> = ({
  issue,
  onExpressInterest,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpressed, setHasExpressed] = useState(issue.hasExpressedInterest);
  const [actionError, setActionError] = useState<string | null>(null);

  const rawImageUrl = issue.images && issue.images.length > 0 ? issue.images[0]?.url : undefined;
  const hasImage = Boolean(rawImageUrl) && !imageError;

  const locationLabel =
    issue.location?.locality ||
    issue.location?.city ||
    issue.location?.address ||
    "Location specified";

  const categoryLabel = issue.category?.name || "Civic Issue";

  const handleInterestClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitting || hasExpressed) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const success = await onExpressInterest(issue.id);
      if (success) {
        setHasExpressed(true);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to express interest.";
      setActionError(message || "Failed to express interest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md ${className}`.trim()}
    >
      {/* Image container with 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {hasImage ? (
          <img
            src={rawImageUrl}
            alt={issue.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
            <AlertCircle className="h-8 w-8 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-400">No image available</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-xs border border-blue-100/60 max-w-[65%] truncate">
            <span className="truncate">{categoryLabel}</span>
          </span>
          <StatusBadge status={issue.status} className="shadow-xs backdrop-blur-xs" />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {issue.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Location & Time */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(issue.createdAt)}</span>
            </div>
          </div>

          {actionError && (
            <p className="text-xs text-red-600 leading-tight">{actionError}</p>
          )}

          {/* Express Interest Button / Status */}
          <div className="pt-1">
            {hasExpressed ? (
              <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 py-2 px-3 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Interest Expressed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInterestClick}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <HandHeart className="h-3.5 w-3.5" />
                    <span>Express Interest</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
