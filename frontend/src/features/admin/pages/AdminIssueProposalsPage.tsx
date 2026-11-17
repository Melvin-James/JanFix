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
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from "../components";
import JanAIProposalRecommendationCard from "../components/JanAIProposalRecommendationCard";
import {
  getProposalsForIssue,
  getIssueProposalRecommendation,
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

              return (
                <div
                  key={prop.proposalId}
                  className={`rounded-xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                    isRecommended
                      ? "border-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-slate-200"
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

                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shrink-0">
                          Recommended
                        </span>
                      )}
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
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Status:{" "}
                      <strong className="text-slate-700 capitalize">
                        {String(prop.status || "Submitted").toLowerCase()}
                      </strong>
                    </span>

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIssueProposalsPage;
