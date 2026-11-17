import React, { useState } from "react";
import { MapPin, ArrowRight, Users, Image as ImageIcon } from "lucide-react";
import type {
  AdminIssueProposalSummary,
  ProviderPreview,
} from "../../types/adminProposalTypes";

export interface AdminIssueProposalCardProps {
  issue: AdminIssueProposalSummary;
  onReview: (issueId: string) => void;
}

/**
 * Individual provider avatar with graceful image-error fallback to name initials.
 */
function ProviderAvatarItem({ provider }: { provider: ProviderPreview }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "P";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "P";
    return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase() || "P";
  };

  if (provider.avatarUrl && !imgError) {
    return (
      <img
        src={provider.avatarUrl}
        alt={provider.name || "Provider avatar"}
        title={provider.name || "Provider"}
        onError={() => setImgError(true)}
        className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover bg-slate-100 shrink-0"
      />
    );
  }

  return (
    <span
      title={provider.name || "Provider"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold ring-2 ring-white shrink-0 uppercase select-none"
    >
      {getInitials(provider.name)}
    </span>
  );
}

export const AdminIssueProposalCard: React.FC<AdminIssueProposalCardProps> = ({
  issue,
  onReview,
}) => {
  const [imageError, setImageError] = useState(false);

  // Extract the first available issue image with a valid URL
  const firstImage = issue.images?.find(
    (img) => img && typeof img.url === "string" && img.url.trim() !== ""
  );
  const displayImageUrl = firstImage?.url;

  // Window status & deadline calculation (shown only when available)
  const showWindowBadge = Boolean(issue.proposalWindowStatus || issue.proposalDeadlineAt);
  const isWindowOpen = issue.proposalWindowStatus === "OPEN";

  let deadlineLabel: string | null = null;
  if (issue.proposalDeadlineAt) {
    const deadline = new Date(issue.proposalDeadlineAt);
    if (!isNaN(deadline.getTime())) {
      const now = new Date();
      const diffHours = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffHours / 24);
      if (diffDays > 0) {
        deadlineLabel = `${diffDays}d left`;
      } else if (diffHours > 0) {
        deadlineLabel = `${diffHours}h left`;
      } else {
        deadlineLabel = "Expired";
      }
    }
  }

  // Deduplicate unique providers by ID for the avatar stack
  const uniqueProviders = (issue.providers || []).reduce<ProviderPreview[]>(
    (acc, provider) => {
      if (provider && provider.id && !acc.some((p) => p.id === provider.id)) {
        acc.push(provider);
      }
      return acc;
    },
    []
  );

  const displayedProviders = uniqueProviders.slice(0, 3);
  const remainingCount = uniqueProviders.length - displayedProviders.length;

  return (
    <div className="flex flex-col justify-between h-full rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top Media & Information Area */}
      <div>
        {/* Card Thumbnail Area */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
          {displayImageUrl && !imageError ? (
            <img
              src={displayImageUrl}
              alt={issue.title ? `${issue.title} thumbnail` : "Civic issue thumbnail"}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              <ImageIcon className="h-10 w-10 text-slate-300" />
            </div>
          )}

          {/* Category Pill */}
          <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs backdrop-blur-xs">
            {issue.category?.name || "Civic Issue"}
          </span>

          {/* Proposal Window Status Pill (only when available) */}
          {showWindowBadge && (
            <span
              className={`absolute top-2.5 right-2.5 rounded-md px-2.5 py-1 text-xs font-medium shadow-xs backdrop-blur-xs ${
                isWindowOpen
                  ? "bg-emerald-600/95 text-white"
                  : "bg-slate-800/90 text-white"
              }`}
            >
              {isWindowOpen
                ? deadlineLabel
                  ? `Open • ${deadlineLabel}`
                  : "Window Open"
                : "Window Closed"}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Proposal Count Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              {issue.proposalCount} {issue.proposalCount === 1 ? "Proposal" : "Proposals"}
            </span>
          </div>

          {/* Issue Title */}
          <h3
            className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => onReview(issue.issueId)}
            title={issue.title}
          >
            {issue.title}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-1" title={issue.location?.address}>
              {issue.location?.address || "Location unavailable"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area: Overlapping Avatars & Review Action */}
      <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        {/* Overlapping Provider Avatars Stack */}
        <div className="flex items-center min-w-0">
          {displayedProviders.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden py-0.5 items-center">
              {displayedProviders.map((provider) => (
                <ProviderAvatarItem key={provider.id} provider={provider} />
              ))}
              {remainingCount > 0 && (
                <span
                  title={`${remainingCount} more provider${remainingCount === 1 ? "" : "s"}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold ring-2 ring-white shrink-0"
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>0 providers</span>
            </div>
          )}
        </div>

        {/* Review Proposals Action */}
        <button
          type="button"
          onClick={() => onReview(issue.issueId)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span>Review Proposals</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AdminIssueProposalCard;

