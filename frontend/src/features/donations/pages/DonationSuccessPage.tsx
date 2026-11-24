import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  Calendar,
  CreditCard,
  Building,
  Hash,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { getDonationStatus } from "../services/donationService";
import { getIssueById } from "../../issues/services/issueService";
import type { DonationStatusResponse } from "../types/donationTypes";
import {
  formatINRFromPaise,
  formatDonationDateTime,
} from "../utils/donationFormatters";

export const DonationSuccessPage: React.FC = () => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<DonationStatusResponse | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("Supported civic project");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStatusAndProject = useCallback(async () => {
    if (!donationId) {
      setError("Invalid donation reference.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const statusData = await getDonationStatus(donationId);

      // Verify that status is genuinely SUCCEEDED
      if (statusData.status === "FAILED" || statusData.status === "CANCELED") {
        navigate(`/donations/${donationId}/failure`, { replace: true });
        return;
      }

      if (statusData.status === "PENDING" || statusData.status === "PROCESSING") {
        navigate(`/donations/${donationId}/result`, { replace: true });
        return;
      }

      setDonation(statusData);

      // Fetch project details for display
      try {
        const issueRes = await getIssueById(statusData.issueId);
        if (issueRes?.issue?.title) {
          setProjectTitle(issueRes.issue.title);
        }
      } catch (issueErr) {
        console.warn("Could not load project title for donation receipt:", issueErr);
        // Fallback title remains "Supported civic project"
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (errObj.response?.status === 403) {
        setError("You are not authorized to view this donation.");
      } else if (errObj.response?.status === 404) {
        setError("Donation record not found.");
      } else {
        setError(
          errObj.response?.data?.message ||
            errObj.message ||
            "Unable to retrieve contribution details at this moment."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [donationId, navigate]);

  useEffect(() => {
    fetchStatusAndProject();

    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, [fetchStatusAndProject]);

  const handleCopyId = () => {
    if (!donation?.id) return;
    navigator.clipboard.writeText(donation.id);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 px-4">
          <LoadingState message="Verifying contribution confirmation..." />
        </div>
      </MainLayout>
    );
  }

  if (error || !donation) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <ErrorState message={error || "Contribution information is unavailable."} />
          <div className="pt-2">
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Explore More Projects</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-emerald-50/80 to-white pt-10 pb-6 px-6 text-center border-b border-slate-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-in zoom-in duration-300" />
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contribution Successful!
            </h1>

            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for supporting this civic initiative. Your contribution helps
              make a real and lasting difference in our community.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Payment Confirmed by JanFix Ledger</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Contribution Summary
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Check className="h-3 w-3" />
                  SUCCEEDED
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span>Amount Contributed</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                  {formatINRFromPaise(donation.amountPaise)}
                </span>
              </div>

              {/* Project Title */}
              <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-600 text-sm shrink-0">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span>Supported Project</span>
                </div>
                <Link
                  to={`/issues/${donation.issueId}`}
                  className="text-sm font-semibold text-slate-900 hover:text-emerald-600 text-right line-clamp-2 transition-colors flex items-center justify-end gap-1 group"
                >
                  <span>{projectTitle}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </Link>
              </div>

              {/* Payment Date */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Payment Date</span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {formatDonationDateTime(donation.paidAt || donation.createdAt)}
                </span>
              </div>

              {/* Reference ID */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span>Donation Reference</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {donation.id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy donation reference"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-sm text-slate-600">Currency</span>
                <span className="text-sm font-medium text-slate-700 font-mono">
                  {donation.currency.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Reassuring Ledger Transparency Note */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-semibold text-slate-800">
                  Community Ledger Verified
                </span>
                <p>
                  Your contribution has been atomically credited to this civic
                  fundraising campaign. Your name or anonymous pledge will be visible on
                  the public contributors list.
                </p>
              </div>
            </div>

            {/* Page Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to={`/issues/${donation.issueId}`}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors text-center"
              >
                <Heart className="h-4 w-4 fill-emerald-100" />
                <span>View Supported Project</span>
              </Link>
              <Link
                to="/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
              >
                <span>Explore More Issues</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonationSuccessPage;
