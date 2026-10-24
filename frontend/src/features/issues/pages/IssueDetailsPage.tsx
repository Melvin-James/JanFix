import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Lock,
  Globe,
  AlertCircle,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { StatusBadge } from "../../../components/UI/StatusBadge";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { getIssueById } from "../services/issueService";
import type { Issue } from "../types/issue";
import { formatRelativeTime } from "../../../utils/date";

export const IssueDetailsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIssue = async () => {
      if (!issueId) {
        setError("Invalid issue identifier.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await getIssueById(issueId);
        if (!isMounted) return;
        setIssue(response.issue);
        if (response.issue.images && response.issue.images.length > 0) {
          setSelectedImage(response.issue.images[0]?.url || null);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load issue details. You may not be authorized to view this issue.";
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIssue();
    return () => {
      isMounted = false;
    };
  }, [issueId]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation back */}
        <div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Community Issues</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingState message="Loading issue details..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-xs space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Unable to View Issue</h2>
            <ErrorState message={error} />
            <div className="pt-2">
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to Feed
              </Link>
            </div>
          </div>
        ) : issue ? (
          <div className="space-y-6">
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

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Reported {formatRelativeTime(issue.createdAt)}</span>
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
                      {[issue.location.locality, issue.location.city, issue.location.state]
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
                    <span className="text-slate-500">Reported Date</span>
                    <span className="font-medium text-slate-800">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visibility</span>
                    <span className="font-medium text-slate-800">{issue.visibility}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default IssueDetailsPage;
