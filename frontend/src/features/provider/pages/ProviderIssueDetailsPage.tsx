import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HandHeart,
} from "lucide-react";
import ProviderLayout from "../components/workspace/ProviderLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { IssueDetailsContent } from "../../issues/components/IssueDetailsContent";
import { SimilarIssuesSection } from "../components/SimilarIssuesSection";
import {
  getProviderIssueDetails,
  expressInterest,
} from "../services/providerService";
import type { ProviderIssueDetail } from "../types/providerTypes";

export const ProviderIssueDetailsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const [issue, setIssue] = useState<ProviderIssueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [submittingInterest, setSubmittingInterest] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackError, setFeedbackError] = useState<string>("");

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

  // Auto-clear feedback notification
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const handleExpressInterest = async () => {
    if (!issue || submittingInterest || issue.hasExpressedInterest) return;

    try {
      setSubmittingInterest(true);
      setFeedbackError("");
      const res = await expressInterest(issue.id);
      if (res.success) {
        setIssue((prev) => (prev ? { ...prev, hasExpressedInterest: true } : null));
        setFeedbackMessage("Interest expressed successfully! Community members and administrators have been notified.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to express interest. Please try again.";
      setFeedbackError(msg);
    } finally {
      setSubmittingInterest(false);
    }
  };

  const categoryId =
    issue &&
    (typeof issue.category === "object" && issue.category !== null
      ? (issue.category as { id: string }).id
      : typeof issue.category === "string"
      ? issue.category
      : "");

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to="/provider/issues"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Issues</span>
          </Link>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-800 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {feedbackError && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-800 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{feedbackError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackError("")}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                  <div>
                    <p className="text-xs text-slate-500">
                      Express interest to offer your team's assistance in resolving this verified civic report.
                    </p>
                  </div>
                  <div>
                    {issue.hasExpressedInterest ? (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Interest Expressed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleExpressInterest}
                        disabled={submittingInterest}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {submittingInterest ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Submitting Interest...</span>
                          </>
                        ) : (
                          <>
                            <HandHeart className="h-4 w-4" />
                            <span>Express Interest</span>
                          </>
                        )}
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

