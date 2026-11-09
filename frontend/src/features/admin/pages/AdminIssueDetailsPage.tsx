import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import {
  ConfirmationModal,
  RejectReasonModal,
  AdminLoadingState,
  AdminErrorState,
  JanAICommunityAnalysisCard,
} from "../components";
import { IssueDetailsContent } from "../../issues/components/IssueDetailsContent";
import { IssueCommentsModal } from "../../issues/components/IssueCommentsModal";
import { getIssueById } from "../../issues/services/issueService";
import { approveIssue, rejectIssue } from "../services/adminService";
import { getIssueAIAnalysis, triggerIssueAIAnalysis } from "../services/adminAIService";
import type { Issue } from "../../issues/types/issue";
import type { IssueAIAnalysis } from "../types/adminAITypes";

export const AdminIssueDetailsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loadingIssue, setLoadingIssue] = useState(Boolean(issueId));
  const [issueError, setIssueError] = useState(issueId ? "" : "Invalid issue ID.");

  // JanAI Analysis State
  const [analysis, setAnalysis] = useState<IssueAIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(Boolean(issueId));
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isRetryingAnalysis, setIsRetryingAnalysis] = useState(false);

  // Moderation state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!issueId) return;

    getIssueById(issueId)
      .then((response) => {
        if (isMounted) setIssue(response.issue);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to load issue details.";
          setIssueError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingIssue(false);
      });

    getIssueAIAnalysis(issueId)
      .then((response) => {
        if (isMounted) setAnalysis(response.analysis);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to retrieve JanAI analysis.";
          setAnalysisError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingAnalysis(false);
      });

    return () => {
      isMounted = false;
    };
  }, [issueId]);

  const handleRetryAnalysis = async () => {
    if (!issueId) return;
    setIsRetryingAnalysis(true);
    setAnalysisError(null);
    try {
      const response = await triggerIssueAIAnalysis(issueId);
      setAnalysis(response.analysis);
      setActionSuccess("JanAI analysis successfully updated.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to analyze comments. Please try again later.";
      setAnalysisError(msg);
    } finally {
      setIsRetryingAnalysis(false);
    }
  };

  const handleConfirmApprove = async () => {
    if (!issue) return;
    try {
      setIsSubmittingDecision(true);
      setActionError("");
      const response = await approveIssue(issue.id);
      setIssue(response.issue);
      setApproveModalOpen(false);
      setActionSuccess(response.message || "Issue approved successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to approve issue. Please try again.";
      setActionError(msg);
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
      setActionError("");
      const response = await rejectIssue(issue.id, trimmed);
      setIssue(response.issue);
      setRejectModalOpen(false);
      setRejectionReason("");
      setRejectError("");
      setActionSuccess(response.message || "Issue rejected successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to reject issue. Please try again.";
      setActionError(msg);
      setRejectError(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  if (loadingIssue) {
    return <AdminLoadingState message="Loading issue details & AI analysis..." />;
  }

  if (issueError || !issue) {
    return (
      <div className="p-6">
        <AdminErrorState message={issueError || "Issue not found."} />
      </div>
    );
  }

  const canModerate = issue.status === "REPORTED";

  return (
    <div className="p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/issues"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Issue Review Queue</span>
        </Link>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {actionError && !approveModalOpen && !rejectModalOpen && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Admin Review Action Banner */}
      {canModerate && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                <ShieldAlert className="h-5 w-5 text-indigo-600" />
                <span>Administrator Moderation Panel</span>
              </div>
              <p className="mt-1 text-xs text-indigo-700">
                This issue is currently in <strong>{issue.status}</strong> status. Consult JanAI Community Analysis below before verifying or rejecting.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setApproveModalOpen(true);
                  setActionError("");
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
                  setActionError("");
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

      {/* JanAI Community Analysis Section */}
      <JanAICommunityAnalysisCard
        analysis={analysis}
        loading={loadingAnalysis}
        error={analysisError}
        onRetry={handleRetryAnalysis}
        isRetrying={isRetryingAnalysis}
      />

      {/* Core Issue Presentation Details */}
      <IssueDetailsContent
        issue={issue}
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span>View Raw Comments</span>
            </button>
          </div>
        }
      />

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={approveModalOpen}
        title="Approve Civic Issue"
        message={`Are you sure you want to verify and approve "${issue.title}"? This will mark the issue as VERIFIED and open the 5-day provider proposal window.`}
        confirmLabel="Confirm Approval"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isSubmittingDecision}
        errorMessage={actionError}
        onConfirm={handleConfirmApprove}
        onClose={() => setApproveModalOpen(false)}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={rejectModalOpen}
        title="Reject Civic Issue"
        subtitle={`Provide a constructive reason explaining why "${issue.title}" is being rejected.`}
        placeholder="Explain why this issue is being rejected..."
        rejectionReason={rejectionReason}
        rejectError={rejectError || actionError}
        isRejecting={isSubmittingDecision}
        confirmButtonText="Confirm Rejection"
        cancelButtonText="Cancel"
        maxLength={1000}
        onReasonChange={(val) => {
          setRejectionReason(val);
          setRejectError("");
          setActionError("");
        }}
        onConfirm={handleConfirmReject}
        onClose={() => setRejectModalOpen(false)}
      />

      {/* Comments Drawer / Modal */}
      <IssueCommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        issue={issue}
      />
    </div>
  );
};
export default AdminIssueDetailsPage;
