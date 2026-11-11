import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  Info,
  Calendar,
} from "lucide-react";
import ProviderLayout from "../components/workspace/ProviderLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { ConfirmationModal } from "../../../components/UI/ConfirmationModal";
import { ProposalSharedFieldsSection } from "../components/proposals/ProposalSharedFieldsSection";
import { BudgetBreakdownSection } from "../components/proposals/BudgetBreakdownSection";
import { ExecutionRoadmapSection } from "../components/proposals/ExecutionRoadmapSection";
import { NgoProposalFieldsSection } from "../components/proposals/NgoProposalFieldsSection";
import {
  proposalFormSchema,
  type ProposalFormData,
} from "../validations/proposalValidationSchema";
import {
  submitProposal,
  getMyProposal,
  updateProposal,
  withdrawProposal,
} from "../services/providerProposalService";
import { getProviderIssueDetails } from "../services/providerService";
import type { ProviderIssueDetail } from "../types/providerTypes";
import type { Proposal } from "../types/proposalTypes";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

export const ProviderProposalSubmissionPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [issue, setIssue] = useState<ProviderIssueDetail | null>(null);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isNgo = user?.providerProfile?.identity?.providerType === "NGO";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      isNgo,
      estimatedTeamSize: 1,
      estimatedDurationHours: 4,
      budgetItems: [],
      executionRoadmap: [],
      requiresFunding: false,
      participationMode: "TEAM_ONLY",
      requiresCommunityChat: false,
    },
  });

  // Calculate deadline remaining
  const proposalDeadline = issue?.proposalDeadlineAt
    ? new Date(issue.proposalDeadlineAt)
    : null;
  const isDeadlinePassed = proposalDeadline
    ? new Date().getTime() >= proposalDeadline.getTime()
    : false;
  const isWindowClosed =
    issue?.proposalWindowStatus === "CLOSED" ||
    issue?.proposalWindowStatus === "CANCELLED" ||
    isDeadlinePassed;

  useEffect(() => {
    let mounted = true;
    if (!issueId) {
      setError("Invalid issue identifier");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [issueRes, proposalRes] = await Promise.all([
          getProviderIssueDetails(issueId),
          getMyProposal(issueId).catch(() => null),
        ]);

        if (!mounted) return;
        setIssue(issueRes.issue);
        if (issueRes.issue.images && issueRes.issue.images.length > 0) {
          setSelectedPhoto(issueRes.issue.images[0]?.url || null);
        }

        if (proposalRes && proposalRes.status === "SUBMITTED") {
          setExistingProposal(proposalRes);
          // Prefill form
          reset({
            isNgo,
            estimatedTeamSize: proposalRes.estimatedTeamSize,
            estimatedDurationHours: proposalRes.estimatedDurationHours,
            budgetItems: proposalRes.budgetItems.map((b) => ({
              heading: b.heading,
              amountRupees: b.amountRupees || b.amountPaise / 100,
            })),
            executionRoadmap: proposalRes.executionRoadmap.map((r) => ({
              heading: r.heading,
              description: r.description,
              startTime: r.startTime,
              endTime: r.endTime,
            })),
            requiresFunding: proposalRes.ngoDetails?.requiresFunding ?? false,
            participationMode: proposalRes.ngoDetails?.participationMode ?? "TEAM_ONLY",
            expectedParticipants: proposalRes.ngoDetails?.expectedParticipants,
            requiresCommunityChat: proposalRes.ngoDetails?.requiresCommunityChat ?? false,
          });
        }
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Failed to load proposal information. You may not be authorized to view this page.";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [issueId, reset, isNgo]);

  const onValidSubmit = () => {
    setFeedbackError(null);
    setConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!issueId) return;
    try {
      setSubmitting(true);
      setFeedbackError(null);
      const data = watch();

      const payload = {
        estimatedTeamSize: Number(data.estimatedTeamSize),
        estimatedDurationHours: Number(data.estimatedDurationHours),
        budgetItems: data.budgetItems.map((item) => ({
          heading: item.heading,
          amountRupees: item.amountRupees,
          amountPaise: Math.round(item.amountRupees * 100),
        })),
        executionRoadmap: data.executionRoadmap.map((item, idx) => ({
          heading: item.heading,
          description: item.description,
          startTime: item.startTime,
          endTime: item.endTime,
          order: idx,
        })),
        ...(isNgo
          ? {
              ngoDetails: {
                requiresFunding: Boolean(data.requiresFunding),
                participationMode: data.participationMode || "TEAM_ONLY",
                expectedParticipants:
                  data.participationMode === "OPEN_COMMUNITY"
                    ? Number(data.expectedParticipants)
                    : undefined,
                requiresCommunityChat: Boolean(data.requiresCommunityChat),
              },
            }
          : {}),
      };

      if (existingProposal) {
        const res = await updateProposal(issueId, payload);
        setExistingProposal(res.proposal);
        toast.success("Proposal updated")
        setFeedbackSuccess("Proposal updated successfully!");
      } else {
        const res = await submitProposal(issueId, payload);
        setExistingProposal(res.proposal);
        toast.success("Proposal submitted")
        setFeedbackSuccess("Proposal submitted successfully!");
      }

      setConfirmSubmitOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to submit proposal. Please check your inputs and try again.";
      setFeedbackError(msg);
      setConfirmSubmitOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!issueId || !existingProposal) return;
    try {
      setIsWithdrawing(true);
      setFeedbackError(null);
      await withdrawProposal(issueId);
      setExistingProposal(null);
      setWithdrawModalOpen(false);
      setFeedbackSuccess("Your proposal has been withdrawn.");
      setTimeout(() => {
        navigate(`/provider/issues/${issueId}`);
      }, 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to withdraw proposal.";
      setFeedbackError(msg);
      setWithdrawModalOpen(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            to={issueId ? `/provider/issues/${issueId}` : "/provider/issues"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Issue Details</span>
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

        {/* Feedback Banners */}
        {feedbackSuccess && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-800 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{feedbackSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackSuccess(null)}
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
              onClick={() => setFeedbackError(null)}
              className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingState message="Loading issue & proposal details..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-xs space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Unable to Load Proposal</h2>
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
          <div className="space-y-6">
            {/* Status & Instructions Card */}
            {existingProposal ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm sm:text-base">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>You Have an Active Proposal for this Issue</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Submitted on {new Date(existingProposal.submittedAt).toLocaleDateString()} at{" "}
                    {new Date(existingProposal.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                    {!isWindowClosed
                      ? " You can modify or withdraw your proposal until the submission deadline."
                      : " The submission window has now ended."}
                  </p>
                </div>

                {!isWindowClosed && (
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(true)}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-red-300 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    <span>Withdraw Proposal</span>
                  </button>
                )}
              </div>
            ) : isWindowClosed ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-xs flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-800 leading-relaxed">
                  <strong className="block text-sm font-semibold">
                    Proposal Submission Window Has Closed
                  </strong>
                  The 5-day proposal window for this verified civic issue has reached its deadline. New proposals can no longer be accepted.
                </div>
              </div>
            ) : null}

            {/* Read-only Issue Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                    {issue.categoryName || "Civic Issue"}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    Reported by {issue.reporterName || "Community Member"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Reported: {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {issue.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>

              {/* Original Reporter Uploaded Photos */}
              {issue.images && issue.images.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <Info className="h-4 w-4 text-slate-400" />
                    <span>Reporter Photos (Site Context)</span>
                  </div>

                  {selectedPhoto && (
                    <div className="relative aspect-[16/9] max-h-80 w-full overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={selectedPhoto}
                        alt="Selected site preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {issue.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {issue.images.map((img, idx) => (
                        <button
                          key={img.key || idx}
                          type="button"
                          onClick={() => setSelectedPhoto(img.url)}
                          className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                            selectedPhoto === img.url
                              ? "border-blue-600 ring-2 ring-blue-500/20"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Site Photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Proposal Form */}
            <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
              {/* Section 1: Shared Fields (Team Size, Duration, Start Date) */}
              <ProposalSharedFieldsSection
                register={register}
                errors={errors}
                isReadOnly={isWindowClosed}
              />

              {/* Section 2: Budget Breakdown */}
              <Controller
                name="budgetItems"
                control={control}
                render={({ field }) => (
                  <BudgetBreakdownSection
                    items={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.budgetItems?.message}
                    isReadOnly={isWindowClosed}
                  />
                )}
              />

              {/* Section 3: Execution Roadmap */}
              <Controller
                name="executionRoadmap"
                control={control}
                render={({ field }) => (
                  <ExecutionRoadmapSection
                    items={field.value || []}
                    onChange={(newItems) => field.onChange(newItems)}
                    error={errors.executionRoadmap?.message}
                    isReadOnly={isWindowClosed}
                  />
                )}
              />

              {/* Section 4: NGO Considerations (Conditionally rendered) */}
              {isNgo && (
                <NgoProposalFieldsSection
                  watch={watch}
                  setValue={setValue}
                  register={register}
                  errors={errors}
                  isReadOnly={isWindowClosed}
                />
              )}

              {/* Form Submission Actions */}
              {!isWindowClosed && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                    By submitting, your structured proposal will be recorded for civic moderation and community execution scheduling. You may adjust or withdraw your proposal at any time prior to the window deadline.
                  </p>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/provider/issues/${issueId}`)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <span>Processing...</span>
                      ) : existingProposal ? (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Update Proposal</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Proposal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : null}
      </div>

      {/* Confirmation Modal for Proposal Submission */}
      <ConfirmationModal
        isOpen={confirmSubmitOpen}
        title={existingProposal ? "Update Proposal Submission" : "Submit Structured Proposal"}
        message={`Are you sure you want to ${
          existingProposal ? "update" : "submit"
        } this proposal for "${issue?.title}"? You will be able to edit or withdraw your proposal until the submission deadline.`}
        confirmLabel={existingProposal ? "Confirm Update" : "Confirm Submission"}
        cancelLabel="Review Again"
        variant="primary"
        isLoading={submitting}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmSubmitOpen(false)}
      />

      {/* Confirmation Modal for Proposal Withdrawal */}
      <ConfirmationModal
        isOpen={withdrawModalOpen}
        title="Withdraw Proposal"
        message="Are you sure you want to withdraw your proposal? Withdrawn proposals are excluded from active evaluation, though you can resubmit before the deadline if your schedule permits."
        confirmLabel="Yes, Withdraw Proposal"
        cancelLabel="Keep Proposal"
        variant="danger"
        isLoading={isWithdrawing}
        onConfirm={handleConfirmWithdraw}
        onClose={() => setWithdrawModalOpen(false)}
      />
    </ProviderLayout>
  );
};

export default ProviderProposalSubmissionPage;

