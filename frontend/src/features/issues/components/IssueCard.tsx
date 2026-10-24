import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Eye, AlertCircle, Lock } from "lucide-react";
import type { Issue } from "../types/issue";
import { StatusBadge } from "../../../components/UI/StatusBadge";
import { formatRelativeTime } from "../../../utils/date";

export interface IssueCardProps {
  issue: Issue;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, className = "" }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const rawImageUrl = issue.images && issue.images.length > 0 ? issue.images[0]?.url : undefined;
  const hasImage = Boolean(rawImageUrl) && !imageError;

  const locationLabel =
    issue.location?.locality ||
    issue.location?.city ||
    issue.location?.address ||
    "Location specified";

  const categoryLabel = issue.categoryName || "Civic Issue";

  const handleCardClick = () => {
    navigate(`/issues/${issue.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`View details for ${issue.title}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`.trim()}
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
            {issue.visibility === "PRIVATE" && <Lock className="h-3 w-3 shrink-0 text-amber-600" />}
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

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
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

          {/* Action indicator */}
          <div className="flex items-center justify-end gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700 pt-1">
            <span>View Details</span>
            <Eye className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default IssueCard;
