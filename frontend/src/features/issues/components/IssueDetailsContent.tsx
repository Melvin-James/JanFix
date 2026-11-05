import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Lock,
  Globe,
  AlertCircle,
  User,
} from "lucide-react";
import { StatusBadge } from "../../../components/UI/StatusBadge";
import type { Issue } from "../types/issue";
import { formatRelativeTime } from "../../../utils/date";

export interface IssueDetailsContentProps {
  issue: Issue;
  actions?: React.ReactNode;
}

export const IssueDetailsContent: React.FC<IssueDetailsContentProps> = ({
  issue,
  actions,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    issue.images && issue.images.length > 0 ? issue.images[0]?.url || null : null
  );

  useEffect(() => {
    if (issue.images && issue.images.length > 0) {
      setSelectedImage(issue.images[0]?.url || null);
    } else {
      setSelectedImage(null);
    }
  }, [issue.id, issue.images]);

  return (
    <div className="space-y-6">
      {/* Rejection Notice (Shown when status is REJECTED and rejectionReason is accessible) */}
      {issue.status === "REJECTED" && issue.rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-red-900">
                Rejection Notice
              </h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">
                {issue.rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
              {issue.categoryName || "Civic Issue"}
            </span>
            <StatusBadge status={issue.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {issue.visibility === "PRIVATE" ? (
                <>
                  <Lock className="h-3 w-3 text-amber-600" />
                  <span>Private Issue</span>
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 text-blue-600" />
                  <span>Public Issue</span>
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Reported by:{" "}
                <strong className="font-semibold text-slate-900">
                  {issue.reporterName || "Community Member"}
                </strong>
              </span>
            </span>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Reported {formatRelativeTime(issue.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {issue.title}
          </h1>
          <p className="mt-4 text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* Custom Actions Slot (e.g. User voting/comments or Provider express interest) */}
        {actions && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            {actions}
          </div>
        )}
      </div>

      {/* Photos Section */}
      {issue.images && issue.images.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Attached Photos</h2>
          {selectedImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
              <img
                src={selectedImage}
                alt="Selected issue preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {issue.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
              {issue.images.map((img, idx) => (
                <button
                  key={img.key || idx}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                    selectedImage === img.url
                      ? "border-blue-600 ring-2 ring-blue-500/30"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2>Location Details</h2>
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-medium text-slate-800">
              {issue.location.address}
            </p>
            {(issue.location.locality || issue.location.city) && (
              <p>
                {[
                  issue.location.locality,
                  issue.location.city,
                  issue.location.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {issue.location.postalCode && (
              <p className="text-slate-500">PIN: {issue.location.postalCode}</p>
            )}
            {issue.location.coordinates && (
              <p className="text-xs text-slate-400 pt-2 font-mono">
                Coordinates: {issue.location.coordinates.latitude.toFixed(5)},{" "}
                {issue.location.coordinates.longitude.toFixed(5)}
              </p>
            )}
          </div>
        </div>

        {/* Status Timeline / Info Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h2>Timeline & Verification</h2>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Current Status</span>
              <span className="font-medium text-slate-800">{issue.status}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Reported By</span>
              <span className="font-semibold text-slate-800">
                {issue.reporterName || "Community Member"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Reported Date</span>
              <span className="font-medium text-slate-800">
                {issue.createdAt
                  ? new Date(issue.createdAt).toLocaleDateString()
                  : "Recent"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Visibility</span>
              <span className="font-medium text-slate-800">
                {issue.visibility}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsContent;

