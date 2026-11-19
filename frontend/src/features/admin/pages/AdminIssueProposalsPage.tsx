import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  User,
  Building,
  HeartHandshake,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  Award,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from "../components";
import ConfirmationModal from "../components/ConfirmationModal";
import JanAIProposalRecommendationCard from "../components/JanAIProposalRecommendationCard";
import {
  getProposalsForIssue,
  getIssueProposalRecommendation,
  selectProposal,
} from "../services/adminProposalService";
import type {
  AdminIssueProposalsComparisonResponse,
  AdminProposalAIRecommendation,
} from "../types/adminProposalTypes";
import { formatRelativeTime, formatDate } from "../../../utils/date";

interface ComparisonProviderAvatarProps {
  avatarUrl?: string | null;
  providerName: string;
  providerType: string;
}

const ComparisonProviderAvatar: React.FC<ComparisonProviderAvatarProps> = ({
  avatarUrl,
  providerName,
  providerType,
}) => {
  const [imageError, setImageError] = useState(false);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "NGO":
      case "BUSINESS":
        return <Building className="h-4 w-4 text-purple-600" />;
      case "VOLUNTEER_GROUP":
        return <HeartHandshake className="h-4 w-4 text-emerald-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={providerName}
        onError={() => setImageError(true)}
        className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 shrink-0">
      {getProviderIcon(providerType)}
    </div>
  );
};

export const AdminIssueProposalsPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();

  const [comparisonData, setComparisonData] =
    useState<AdminIssueProposalsComparisonResponse | null>(null);
  const [recommendation, setRecommendation] =
    useState<AdminProposalAIRecommendation | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);
  const [dataError, setDataError] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRetryingAI, setIsRetryingAI] = useState(false);

  // Selection states
  const [selectingProposalId, setSelectingProposalId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectionSuccessMessage, setSelectionSuccessMessage] = useState<string | null>(null);

  const fetchProposalsData = async () => {
    if (!issueId) return;
    try {
      setDataError("");
      const data = await getProposalsForIssue(issueId);
      setComparisonData(data);
    } catch {
      setDataError("Failed to load proposals for this issue. Please try again.");
    }
  };

  const handleConfirmSelection = async () => {
    if (!issueId || !selectingProposalId || isSelecting) return;
    try {
      setIsSelecting(true);
      setSelectionError(null);
      await selectProposal(issueId, selectingProposalId);
      setSelectionSuccessMessage("Proposal selected successfully. Civic work assignment is finalized.");
      setSelectingProposalId(null);
      await fetchProposalsData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to select proposal. Please try again.";
      setSelectionError(message);
    } finally {
      setIsSelecting(false);
    }
  };

  // Manual retry handler for JanAI recommendation
  const handleRetryAI = async () => {
    if (!issueId || isRetryingAI) return;
    try {
      setIsRetryingAI(true);
      setAiError(null);
      const rec = await getIssueProposalRecommendation(issueId, true);
      setRecommendation(rec);
    } catch {
      setAiError("Unable to fetch JanAI proposal recommendation.");
    } finally {
      setIsRetryingAI(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (!issueId) return;

    const loadData = async () => {
      try {
        setDataError("");
        const data = await getProposalsForIssue(issueId);
        if (!isCancelled) {
          setComparisonData(data);
        }
      } catch {
        if (!isCancelled) {
          setDataError("Failed to load proposals for this issue. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingData(false);
        }
      }
    };

    const loadAI = async () => {
      try {
        setAiError(null);
        const rec = await getIssueProposalRecommendation(issueId, false);
        if (!isCancelled) {
          setRecommendation(rec);
        }
      } catch {
        if (!isCancelled) {
          setAiError("Unable to fetch JanAI proposal recommendation.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingAI(false);
        }
      }
    };

    void loadData();
    void loadAI();

    return () => {
      isCancelled = true;
    };
  }, [issueId]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProviderBadge = (type: string) => {
    switch (type) {
      case "NGO":
      case "BUSINESS":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "VOLUNTEER_GROUP":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <AdminLoadingState message="Loading issue proposals and comparison..." />
      </div>
    );
  }

  if (dataError || !comparisonData) {
    return (
      <div className="p-6 space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/proposals")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Proposals</span>
        </button>
        <AdminErrorState message={dataError || "Issue not found."} />
      </div>
    );
  }

  const { issue, proposals, submittedProposalCount } = comparisonData;
  const issueImage = issue.images?.[0]?.url;

  const isAlreadySelected = Boolean(
    issue.selectedProposalId || proposals.some((p) => p.status === "SELECTED")
  );
  const selectedProposal = proposals.find(
    (p) => p.status === "SELECTED" || p.proposalId === issue.selectedProposalId
  );
  const deadlineDate = issue.proposalDeadlineAt
    ? new Date(issue.proposalDeadlineAt)
    : null;
  const isDeadlinePassed = deadlineDate
    ? new Date().getTime() >= deadlineDate.getTime()
    : false;
  const isWindowCancelled = issue.proposalWindowStatus === "CANCELLED";
  const canSelectProposals =
    isDeadlinePassed &&
    !isAlreadySelected &&
    !isWindowCancelled &&
    issue.status === "VERIFIED";

  return (
    <div className="space-y-6 p-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/admin/proposals")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Proposals</span>
        </button>

        <span className="text-xs text-slate-400">
          Issue ID: <code className="font-mono text-slate-600">{issue.id}</code>
        </span>
      </div>

      <AdminPageHeader
        title="Issue Proposals Comparison"
        description={`Reviewing ${submittedProposalCount} submitted ${
          submittedProposalCount === 1 ? "proposal" : "proposals"
        } for: ${issue.title}`}
      />

      {/* Proposal Selection Lifecycle State Banner */}
      {isAlreadySelected ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-2xs">
          <Award className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              Proposal Selection Complete
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Provider <strong>{selectedProposal?.providerName || "Assigned Provider"}</strong> has been selected for this project
              {issue.proposalSelectedAt && (
                <span> on {formatDate(issue.proposalSelectedAt)}</span>
              )}. All other submitted proposals have been finalized as not selected.
            </p>
          </div>
        </div>
      ) : !isDeadlinePassed ? (
        <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-2xs">
          <Info className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-900">
              Proposal Submission Window Active
            </h4>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Service providers can submit and update proposals until the 5-day window ends
              {issue.proposalDeadlineAt && (
                <span> on <strong>{formatDate(issue.proposalDeadlineAt)}</strong></span>
              )}. Proposal selection will become available immediately after the deadline passes.
            </p>
          </div>
        </div>
      ) : isWindowCancelled ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-900">
              Proposal Window Cancelled
            </h4>
            <p className="text-xs text-red-800 leading-relaxed">
              The proposal submission window for this civic issue was cancelled. Proposals cannot be selected.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              Submission Window Closed – Provider Selection Available
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              The 5-day submission window has closed. Compare the proposals below and select exactly one provider to execute this project.
            </p>
          </div>
        </div>
      )}

      {selectionSuccessMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{selectionSuccessMessage}</span>
        </div>
      )}

      {/* Issue Details Summary Card */}
      <AdminCard className="p-5 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Issue Thumbnail */}
          <div className="relative h-44 w-full md:w-56 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            {issueImage ? (
              <img
                src={issueImage}
                alt={issue.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <ImageIcon className="h-10 w-10 text-slate-300" />
              </div>
            )}
            <span className="absolute top-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-xs">
              {issue.categoryName || "Civic Issue"}
            </span>
          </div>

          {/* Details Overview */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">{issue.title}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Verified Issue
              </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {issue.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-xs">{issue.location.address}</span>
              </span>

              {issue.createdAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Reported {formatRelativeTime(issue.createdAt)}
                </span>
              )}

              {issue.proposalDeadlineAt && (
                <span className="flex items-center gap-1 text-indigo-700 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  Window deadline: {formatDate(issue.proposalDeadlineAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </AdminCard>

      {/* JanAI Issue-Level Proposal Recommendation Section */}
      <JanAIProposalRecommendationCard
        recommendation={recommendation}
        loading={loadingAI}
        error={aiError}
        onRetry={handleRetryAI}
        isRetrying={isRetryingAI}
        proposalCount={submittedProposalCount}
      />

      {/* Proposals Comparison Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submitted Proposals ({submittedProposalCount})
            </h3>
            <p className="text-xs text-slate-500">
              Click on any candidate proposal to view comprehensive budget breakdown, execution roadmap, and provider credentials.
            </p>
          </div>
        </div>

        {proposals.length === 0 ? (
          <AdminCard>
            <AdminEmptyState message="No proposals have been submitted for this issue yet." />
          </AdminCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {proposals.map((prop) => {
              const isRecommended =
                recommendation?.recommendedProposalId === prop.proposalId;
              const isSelected = prop.status === "SELECTED";
              const isNotSelected = prop.status === "NOT_SELECTED";

              return (
                <div
                  key={prop.proposalId}
                  className={`rounded-xl border bg-white p-5 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/15 shadow-sm"
                      : isNotSelected
                      ? "border-slate-200 opacity-75 bg-slate-50/40"
                      : isRecommended
                      ? "border-emerald-300 ring-2 ring-emerald-500/20 hover:shadow-md"
                      : "border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Row: Provider Details */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ComparisonProviderAvatar
                          avatarUrl={prop.providerAvatarUrl}
                          providerName={prop.providerName}
                          providerType={prop.providerType}
                        />

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {prop.providerName}
                            </h4>
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${getProviderBadge(
                                prop.providerType
                              )}`}
                            >
                              {prop.providerType.replace("_", " ")}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-0.5">
                            Submitted {formatRelativeTime(prop.submittedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            Selected Provider
                          </span>
                        )}

                        {isNotSelected && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-600 shrink-0">
                            Not Selected
                          </span>
                        )}

                        {isRecommended && !isNotSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shrink-0">
                            JanAI Recommended
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Proposal Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center border border-slate-100">
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                          Total Budget
                        </span>
                        <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-0.5">
                          {formatINR(prop.totalBudget ?? prop.totalBudgetRupees ?? (prop.totalBudgetPaise ? prop.totalBudgetPaise / 100 : 0))}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                          Team Size
                        </span>
                        <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          {prop.teamSize ?? prop.estimatedTeamSize ?? 1}{" "}
                          {(prop.teamSize ?? prop.estimatedTeamSize ?? 1) === 1
                            ? "person"
                            : "people"}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                          Duration
                        </span>
                        <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {prop.durationHours ?? prop.estimatedDurationHours ?? 0}{" "}
                          {(prop.durationHours ?? prop.estimatedDurationHours ?? 0) === 1
                            ? "hour"
                            : "hours"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">
                      Status:{" "}
                      <strong className="text-slate-700 capitalize">
                        {prop.status === "SELECTED"
                          ? "Selected"
                          : prop.status === "NOT_SELECTED"
                          ? "Not Selected"
                          : "Submitted"}
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {canSelectProposals && prop.status === "SUBMITTED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionError(null);
                            setSelectingProposalId(prop.proposalId);
                          }}
                          disabled={isSelecting}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Select this proposal</span>
                        </button>
                      )}

                      {!isDeadlinePassed && !isAlreadySelected && (
                        <span className="text-[11px] text-slate-400 italic">
                          Selection opens after deadline
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/proposals/issues/${issueId}/proposals/${prop.proposalId}`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Review Proposal</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Proposal Selection */}
      <ConfirmationModal
        isOpen={Boolean(selectingProposalId)}
        title="Select this proposal?"
        message="Are you sure you want to select this provider for this project? All other submitted proposals for this issue will be marked as not selected. This decision cannot be undone through this action."
        confirmLabel="Confirm Selection"
        cancelLabel="Cancel"
        loadingLabel="Selecting..."
        variant="primary"
        isLoading={isSelecting}
        errorMessage={selectionError || undefined}
        onConfirm={handleConfirmSelection}
        onClose={() => {
          if (!isSelecting) {
            setSelectingProposalId(null);
            setSelectionError(null);
          }
        }}
      />
    </div>
  );
};

export default AdminIssueProposalsPage;
