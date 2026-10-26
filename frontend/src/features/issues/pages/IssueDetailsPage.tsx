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
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { StatusBadge } from "../../../components/UI/StatusBadge";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { ConfirmationModal } from "../../../components/UI/ConfirmationModal";
import { RejectReasonModal } from "../../../components/UI/RejectReasonModal";
import { getIssueById } from "../services/issueService";
import { approveIssue, rejectIssue } from "../../admin/services/adminService";
import type { Issue } from "../types/issue";
import { formatRelativeTime } from "../../../utils/date";
import { IssueVoteButton } from "../components/IssueVoteButton";
import { IssueCommentsModal } from "../components/IssueCommentsModal";
import { useAuthStore } from "../../../store/authStore";
import {
  isIssueInteractionOpen,
  formatInteractionTimeRemaining,
} from "../utils/issueEligibility";

export const IssueDetailsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Authentication & Moderation authorization
  const user = useAuthStore((state) => state.user);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  // Moderation state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState("");
  const [decisionError, setDecisionError] = useState("");

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

  // Auto-clear decision feedback
  useEffect(() => {
    if (decisionFeedback) {
      const timer = setTimeout(() => {
        setDecisionFeedback("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [decisionFeedback]);

  // Decision actions for authorized admin
  const handleConfirmApprove = async () => {
    if (!issue) return;
    try {
      setIsSubmittingDecision(true);
      setDecisionError("");
      const response = await approveIssue(issue.id);
      setIssue(response.issue);
      setApproveModalOpen(false);
      setDecisionFeedback(response.message || "Issue approved successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to approve issue. Please try again.";
      setDecisionError(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!issue) return;
    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setRejectError("Rejection reason cannot be empty.");
      return;
    }
    if (trimmed.length > 1000) {
      setRejectError("Rejection reason cannot exceed 1000 characters.");
      return;
    }

    try {
      setIsSubmittingDecision(true);
      setDecisionError("");
      const response = await rejectIssue(issue.id, trimmed);
      setIssue(response.issue);
      setRejectModalOpen(false);
      setRejectionReason("");
      setRejectError("");
      setDecisionFeedback(response.message || "Issue rejected successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to reject issue. Please try again.";
      setDecisionError(msg);
      setRejectError(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const isInteractionOpen = issue ? isIssueInteractionOpen(issue.createdAt) : false;
  const timeRemaining = issue
    ? formatInteractionTimeRemaining(issue.createdAt)
    : { isOpen: false, text: "" };

  const canModerate =
    isAdmin &&
    issue !== null &&
    issue.status === "REPORTED";

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to={isAdmin ? "/admin/issues" : "/feed"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isAdmin ? "Back to Issue Review Queue" : "Back to Community Issues"}</span>
          </Link>
        </div>

        {/* Global Feedback Banner */}
        {decisionFeedback && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-800 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{decisionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setDecisionFeedback("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {decisionError && !approveModalOpen && !rejectModalOpen && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-800 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{decisionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDecisionError("")}
              className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

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
            {/* Admin Moderation Panel (Authorized Admin only, for pending issues) */}
            {canModerate && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                      <ShieldAlert className="h-5 w-5 text-indigo-600" />
                      <span>Administrator Moderation Panel</span>
                    </div>
                    <p className="mt-1 text-xs text-indigo-700">
                      This issue is in <strong>{issue.status}</strong> status. As an administrator, you can verify and approve it for civic resolution or reject it with an explanatory note.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setApproveModalOpen(true);
                        setDecisionError("");
                      }}
                      disabled={isSubmittingDecision}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Issue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModalOpen(true);
                        setRejectionReason("");
                        setRejectError("");
                        setDecisionError("");
                      }}
                      disabled={isSubmittingDecision}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    <span>Reported by: <strong className="font-semibold text-slate-900">{issue.reporterName || "Community Member"}</strong></span>
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

              {/* Interaction Bar (Upvoting & Comments) */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <IssueVoteButton issue={issue} size="md" showLabel={true} />

                  <button
                    type="button"
                    onClick={() => setIsCommentsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <span>Comments</span>
                  </button>
                </div>

                {/* 24-hour interaction status badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                    isInteractionOpen
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeRemaining.text}</span>
                </div>
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
                    <span className="text-slate-500">Reported By</span>
                    <span className="font-semibold text-slate-800">
                      {issue.reporterName || "Community Member"}
                    </span>
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

      {/* Confirmation Modal for Admin Approval */}
      {issue && (
        <ConfirmationModal
          isOpen={approveModalOpen}
          title="Approve Civic Issue"
          message={`Are you sure you want to approve "${issue.title}"? This will advance the status to VERIFIED and forward it for civic resolution.`}
          confirmLabel="Confirm Approval"
          cancelLabel="Cancel"
          loadingLabel="Approving..."
          variant="primary"
          isLoading={isSubmittingDecision}
          errorMessage={decisionError}
          onConfirm={handleConfirmApprove}
          onClose={() => {
            if (!isSubmittingDecision) {
              setApproveModalOpen(false);
              setDecisionError("");
            }
          }}
        />
      )}

      {/* Reusable Modal for Admin Rejection with Reason */}
      {issue && (
        <RejectReasonModal
          isOpen={rejectModalOpen}
          title="Reject Civic Issue"
          subtitle={`Provide a reason for rejecting "${issue.title}". The reporter will be able to see this reason.`}
          placeholder="Explain why this issue is being rejected..."
          rejectionReason={rejectionReason}
          rejectError={rejectError || decisionError}
          isRejecting={isSubmittingDecision}
          confirmButtonText="Confirm Rejection"
          cancelButtonText="Cancel"
          maxLength={1000}
          onReasonChange={(val) => {
            setRejectionReason(val);
            setRejectError("");
            setDecisionError("");
          }}
          onClose={() => {
            if (!isSubmittingDecision) {
              setRejectModalOpen(false);
              setRejectionReason("");
              setRejectError("");
              setDecisionError("");
            }
          }}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Comment modal */}
      {issue && isCommentsOpen && (
        <IssueCommentsModal
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          issue={issue}
        />
      )}
    </MainLayout>
  );
};

export default IssueDetailsPage;
