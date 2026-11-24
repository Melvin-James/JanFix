import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { getDonationStatus } from "../services/donationService";
import { getIssueById } from "../../issues/services/issueService";
import type { DonationStatusResponse } from "../types/donationTypes";
import { formatINRFromPaise } from "../utils/donationFormatters";

export const DonationResultPage: React.FC = () => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<DonationStatusResponse | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("Supported civic project");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef<number>(0);
  const evaluateAndPollRef = useRef<(id: string, isManual?: boolean) => Promise<void>>(async () => {});

  // Clean sensitive Stripe query parameters from the browser address bar upon arrival
  useEffect(() => {
    if (window.location.search) {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {
        // Silently ignore if history state change is unsupported
      }
    }
  }, []);

  const evaluateAndPoll = useCallback(
    async (id: string, isManualCheck = false) => {
      if (isManualCheck) {
        setIsChecking(true);
        setIsTimedOut(false);
      }

      try {
        const statusData = await getDonationStatus(id);
        setDonation(statusData);

        // Fetch project details for display
        if (statusData.issueId) {
          getIssueById(statusData.issueId)
            .then((issueRes) => {
              if (issueRes?.issue?.title) setProjectTitle(issueRes.issue.title);
            })
            .catch(() => {
              // Silently fallback to default project title
            });
        }

        // Terminal states: navigate immediately
        if (statusData.status === "SUCCEEDED") {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          navigate(`/donations/${id}/success`, { replace: true });
          return;
        }

        if (statusData.status === "FAILED" || statusData.status === "CANCELED") {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          navigate(`/donations/${id}/failure`, { replace: true });
          return;
        }

        // Refunded states
        if (statusData.status === "REFUNDED" || statusData.status === "PARTIALLY_REFUNDED") {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          setLoading(false);
          setIsChecking(false);
          return;
        }

        // If PENDING or PROCESSING, continue bounded polling (up to 30 attempts, ~60 seconds)
        pollCountRef.current += 1;
        setLoading(false);
        setIsChecking(false);

        if (pollCountRef.current >= 30) {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          setIsTimedOut(true);
          return;
        }

        pollingTimeoutRef.current = setTimeout(() => {
          evaluateAndPollRef.current(id);
        }, 2000);
      } catch (err: unknown) {
        setLoading(false);
        setIsChecking(false);
        const errObj = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (errObj.response?.status === 403) {
          setError("You are not authorized to view this donation verification.");
        } else if (errObj.response?.status === 404) {
          setError("Donation record not found.");
        } else {
          // If in active polling, retry a couple of times before surfacing a hard error
          if (pollCountRef.current < 5) {
            pollingTimeoutRef.current = setTimeout(() => {
              evaluateAndPollRef.current(id);
            }, 2500);
          } else {
            setError(
              errObj.response?.data?.message ||
                errObj.message ||
                "Unable to retrieve payment verification status."
            );
          }
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    evaluateAndPollRef.current = evaluateAndPoll;
  }, [evaluateAndPoll]);

  useEffect(() => {
    if (!donationId) {
      setError("Invalid donation reference in URL.");
      setLoading(false);
      return;
    }

    pollCountRef.current = 0;
    evaluateAndPoll(donationId);

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [donationId, evaluateAndPoll]);

  const handleManualCheck = () => {
    if (!donationId || isChecking) return;
    pollCountRef.current = 0;
    evaluateAndPoll(donationId, true);
  };

  if (loading && !donation) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 px-4">
          <LoadingState message="Connecting to JanFix payment verification ledger..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <ErrorState message={error} />
          <div className="pt-2">
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle refunded status
  if (donation && (donation.status === "REFUNDED" || donation.status === "PARTIALLY_REFUNDED")) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-14 px-4 sm:px-6">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-xl p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Payment Was Refunded
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                This contribution has been marked as <strong>{donation.status}</strong> on our ledger.
                If you have questions, please reach out to the project organizer.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/issues/${donation.issueId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <span>Back to Project</span>
              </Link>
              <Link
                to="/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Explore Feed</span>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-16 px-4 sm:px-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden p-8 sm:p-10 text-center space-y-6">
          {/* Status Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            {isTimedOut ? (
              <Clock className="h-10 w-10 text-amber-600" />
            ) : (
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            )}
          </div>

          {/* Heading and details */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isTimedOut ? "Verification Pending" : "Verifying Contribution"}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isTimedOut
                ? "Payment confirmation is taking a little longer than usual. Your transaction is registered and will be verified automatically by the JanFix community ledger."
                : "We are verifying your transaction confirmation with the Stripe payment network and JanFix ledger. This usually takes just a few seconds."}
            </p>
          </div>

          {/* Contribution summary badge */}
          {donation && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-w-sm mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Amount:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {formatINRFromPaise(donation.amountPaise)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Project:</span>
                <span className="font-semibold text-slate-900 line-clamp-1 text-right">
                  {projectTitle}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Current Status:</span>
                <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  <Clock className="h-3 w-3" />
                  {donation.status}
                </span>
              </div>
            </div>
          )}

          {/* Informational Guidance */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 text-left flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-950">Important Notice</span>
              <p>
                Please do not submit a duplicate donation while your payment is being
                processed by your bank. Your contribution will update automatically once
                the bank confirms settlement.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking Status...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Check Payment Status</span>
                </>
              )}
            </button>

            {donation?.issueId && (
              <Link
                to={`/issues/${donation.issueId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
              >
                <span>Back to Project</span>
              </Link>
            )}

            <Link
              to="/feed"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              <span>Explore Feed</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonationResultPage;
