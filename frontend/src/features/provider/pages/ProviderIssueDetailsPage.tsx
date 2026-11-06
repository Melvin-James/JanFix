import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Edit3,
} from "lucide-react";
import ProviderLayout from "../components/workspace/ProviderLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { IssueDetailsContent } from "../../issues/components/IssueDetailsContent";
import { SimilarIssuesSection } from "../components/SimilarIssuesSection";
import { getProviderIssueDetails } from "../services/providerService";
import type { ProviderIssueDetail } from "../types/providerTypes";

export const ProviderIssueDetailsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<ProviderIssueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
        const response = await getProviderIssueDetails(issueId);
        if (!isMounted) return;
        setIssue(response.issue);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
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

  const categoryId =
    issue &&
    (typeof issue.category === "object" && issue.category !== null
      ? (issue.category as { id: string }).id
      : typeof issue.category === "string"
      ? issue.category
      : "");

  const hasSubmitted = Boolean(issue?.hasSubmittedProposal ?? issue?.hasExpressedInterest);
  const proposalDeadline = issue?.proposalDeadlineAt ? new Date(issue.proposalDeadlineAt) : null;
  const isDeadlinePassed = proposalDeadline ? new Date().getTime() >= proposalDeadline.getTime() : false;
  const isWindowClosed = issue?.proposalWindowStatus === "CLOSED" || issue?.proposalWindowStatus === "CANCELLED" || isDeadlinePassed;

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation back and Deadline indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            to="/provider/issues"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Issues</span>
          </Link>

          {proposalDeadline && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold border ${
                isWindowClosed
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>
                {isWindowClosed
                  ? "Proposal Window Closed"
                  : `Proposal Deadline: ${proposalDeadline.toLocaleDateString()} at ${proposalDeadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingState message="Loading issue details..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-xs space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to View Issue
            </h2>
            <ErrorState message={error} />
            <div className="pt-2">
              <Link
                to="/provider/issues"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to Issues
              </Link>
            </div>
          </div>
        ) : issue ? (
          <div className="space-y-8">
            {/* Main Issue Details Content */}
            <IssueDetailsContent
              issue={issue}
              actions={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>
                        <strong>{issue.proposalCount ?? 0}</strong> {issue.proposalCount === 1 ? "proposal" : "proposals"} submitted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSubmitted ? (
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Proposal Submitted</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/issues/${issue.id}/proposal`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                          <span>View / Edit Proposal</span>
                        </button>
                      </div>
                    ) : isWindowClosed ? (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Proposal Window Closed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/issues/${issue.id}/proposal`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Proposal</span>
                      </button>
                    )}
                  </div>
                </div>
              }
            />

            {/* Similar Issues Section */}
            {categoryId && (
              <SimilarIssuesSection
                categoryId={categoryId}
                currentIssueId={issue.id}
              />
            )}
          </div>
        ) : null}
      </div>
    </ProviderLayout>
  );
};

export default ProviderIssueDetailsPage;
