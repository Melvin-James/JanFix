import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Clock,
  Building,
  HeartHandshake,
  User,
  FileText,
} from "lucide-react";
import {
  AdminLoadingState,
  AdminErrorState,
} from "../components";
import JanAIProposalSummaryCard from "../components/JanAIProposalSummaryCard";
import AdminProviderProfileCard from "../components/AdminProviderProfileCard";
import IssueLocationPreviewMap from "../components/IssueLocationPreviewMap";
import { BudgetBreakdownSection } from "../../provider/components/proposals/BudgetBreakdownSection";
import { ExecutionRoadmapSection } from "../../provider/components/proposals/ExecutionRoadmapSection";
import {
  getAdminProposalDetails,
  getProposalAISummary,
} from "../services/adminProposalService";
import type {
  AdminProposalDetailsResponse,
  AdminProposalAISummary,
} from "../types/adminProposalTypes";
import { formatRelativeTime, formatDate } from "../../../utils/date";

export const AdminProposalDetailsPage: React.FC = () => {
  const { issueId, proposalId } = useParams<{
    issueId: string;
    proposalId: string;
  }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<AdminProposalDetailsResponse | null>(null);
  const [aiSummary, setAiSummary] = useState<AdminProposalAISummary | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);
  const [dataError, setDataError] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRetryingAI, setIsRetryingAI] = useState(false);

  // Manual retry handler for JanAI individual proposal summary
  const handleRetryAI = async () => {
    if (!issueId || !proposalId || isRetryingAI) return;
    try {
      setIsRetryingAI(true);
      setAiError(null);
      const summary = await getProposalAISummary(issueId, proposalId, true);
      setAiSummary(summary);
    } catch {
      setAiError("Unable to fetch JanAI proposal assessment.");
    } finally {
      setIsRetryingAI(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (!issueId || !proposalId) return;

    const loadDetails = async () => {
      try {
        setDataError("");
        const res = await getAdminProposalDetails(issueId, proposalId);
        if (!isCancelled) {
          setDetails(res);
        }
      } catch {
        if (!isCancelled) {
          setDataError("Failed to load proposal details. Please try again.");
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
        const summary = await getProposalAISummary(issueId, proposalId, false);
        if (!isCancelled) {
          setAiSummary(summary);
        }
      } catch {
        if (!isCancelled) {
          setAiError("Unable to fetch JanAI proposal assessment.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingAI(false);
        }
      }
    };

    void loadDetails();
    void loadAI();

    return () => {
      isCancelled = true;
    };
  }, [issueId, proposalId]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "BUSINESS":
        return <Building className="h-5 w-5 text-purple-600" />;
      case "VOLUNTEER_GROUP":
      case "NGO":
        return <HeartHandshake className="h-5 w-5 text-emerald-600" />;
      default:
        return <User className="h-5 w-5 text-blue-600" />;
    }
  };

  const getProviderBadge = (type: string) => {
    switch (type) {
      case "BUSINESS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "VOLUNTEER_GROUP":
      case "NGO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <AdminLoadingState message="Loading proposal details and provider credentials..." />
      </div>
    );
  }

  if (dataError || !details) {
    return (
      <div className="p-6 space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/proposals/issues/${issueId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Issue Proposals</span>
        </button>
        <AdminErrorState message={dataError || "Proposal details not found."} />
      </div>
    );
  }

  const { proposal, issue, provider } = details;

  const totalBudgetRupees =
    proposal.totalBudgetRupees ??
    (proposal.totalBudgetPaise ? proposal.totalBudgetPaise / 100 : 0);

  const budgetItemsFormData = (proposal.budgetItems || []).map((item) => ({
    heading: item.heading,
    amountRupees: item.amountRupees ?? item.amountPaise / 100,
    amountPaise: item.amountPaise,
  }));

  const roadmapItemsFormData = (proposal.executionRoadmap || []).map((item) => ({
    heading: item.heading,
    description: item.description,
    startTime: item.startTime,
    endTime: item.endTime,
    order: item.order,
  }));

  const providerDisplayName =
    provider.identity.providerName ||
    provider.identity.responsiblePersonName ||
    "Service Provider";

  return (
    <div className="space-y-6 p-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/admin/proposals/issues/${issueId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Issue Proposals</span>
        </button>

        <span className="text-xs text-slate-400">
          Proposal ID: <code className="font-mono text-slate-600">{proposal.id}</code>
        </span>
      </div>

      {/* Main Page Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
              {getProviderIcon(proposal.providerType)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  {providerDisplayName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getProviderBadge(
                    proposal.providerType
                  )}`}
                >
                  {proposal.providerType.replace("_", " ")}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {proposal.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Proposal submitted for: <strong className="text-slate-800">{issue.title}</strong>
                {proposal.submittedAt && (
                  <span> &bull; {formatRelativeTime(proposal.submittedAt)} ({formatDate(proposal.submittedAt)})</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Quick Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-center">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Total Budget
            </span>
            <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5 font-mono">
              {formatINR(totalBudgetRupees)}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-center">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Team Size
            </span>
            <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
              <Users className="h-4 w-4 text-slate-500" />
              {proposal.estimatedTeamSize} {proposal.estimatedTeamSize === 1 ? "Member" : "Members"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-center">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Duration
            </span>
            <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
              <Clock className="h-4 w-4 text-slate-500" />
              {proposal.estimatedDurationHours} Hours
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-center">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Provider Category
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5 uppercase tracking-wide">
              {proposal.providerType.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* JanAI Individual Proposal Summary Section */}
      <JanAIProposalSummaryCard
        summary={aiSummary}
        loading={loadingAI}
        error={aiError}
        onRetry={handleRetryAI}
        isRetrying={isRetryingAI}
      />

      {/* Verified Provider Profile & Credentials */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Provider Credentials & Profile</h2>
        </div>
        <AdminProviderProfileCard provider={provider} />
      </div>

      {/* Associated Issue Information & Location Pin */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Associated Civic Issue</h2>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {issue.categoryName || "Civic Issue"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div className="space-y-2.5">
            <h3 className="font-semibold text-slate-900 text-base">{issue.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              <strong>Location:</strong> {issue.location?.address}
            </p>
          </div>

          {/* Read-only Google Maps Preview */}
          <div>
            <IssueLocationPreviewMap
              coordinates={issue.location?.coordinates}
              address={issue.location?.address}
              className="h-44 w-full rounded-lg overflow-hidden border border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* NGO / Volunteer Group Special Details (if present) */}
      {proposal.ngoDetails && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
            <h3>Community & Volunteer Participation Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white p-3 border border-emerald-100">
              <span className="block text-slate-400 font-medium">Participation Mode</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {proposal.ngoDetails.participationMode === "OPEN_COMMUNITY"
                  ? "Open to Community Volunteers"
                  : "Assigned Team Only"}
              </span>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-100">
              <span className="block text-slate-400 font-medium">Expected Participants</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {proposal.ngoDetails.expectedParticipants ?? "Not specified"}
              </span>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-100">
              <span className="block text-slate-400 font-medium">Community Chat</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {proposal.ngoDetails.requiresCommunityChat ? "Enabled" : "Not Required"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Read-Only Budget Breakdown Section */}
      <BudgetBreakdownSection
        items={budgetItemsFormData}
        onChange={() => {}}
        isReadOnly={true}
      />

      {/* Read-Only Execution Roadmap Section */}
      <ExecutionRoadmapSection
        items={roadmapItemsFormData}
        onChange={() => {}}
        isReadOnly={true}
      />
    </div>
  );
};

export default AdminProposalDetailsPage;
