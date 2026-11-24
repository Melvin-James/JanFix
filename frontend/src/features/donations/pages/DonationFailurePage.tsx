import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Calendar,
  CreditCard,
  Building,
  Hash,
  ShieldAlert,
  Clock,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import {
  getDonationStatus,
  retryDonationPayment,
} from "../services/donationService";
import { getIssueById } from "../../issues/services/issueService";
import { StripeCheckoutForm } from "../components/StripeCheckoutForm";
import { stripePromise } from "../utils/stripe";
import type { DonationStatusResponse } from "../types/donationTypes";
import {
  formatINRFromPaise,
  formatDonationDateTime,
} from "../utils/donationFormatters";

export const DonationFailurePage: React.FC = () => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<DonationStatusResponse | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("Supported civic project");
  const [loading, setLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Retry checkout states
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryClientSecret, setRetryClientSecret] = useState<string | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);
  const [isVerifyingAfterRetry, setIsVerifyingAfterRetry] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string>(
    "Awaiting confirmation from JanFix community ledger..."
  );

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef<number>(0);
  const pollBackendAfterRetryRef = useRef<(id: string) => Promise<void>>(async () => {});

  const fetchStatusAndProject = useCallback(async () => {
    if (!donationId) {
      setPageError("Invalid donation reference.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError(null);

      const statusData = await getDonationStatus(donationId);

      // If donation is actually succeeded, redirect to success page
      if (statusData.status === "SUCCEEDED") {
        navigate(`/donations/${donationId}/success`, { replace: true });
        return;
      }

      // If donation is still pending or processing, redirect to result verification
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
        console.warn("Could not load project title for failed donation:", issueErr);
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (errObj.response?.status === 403) {
        setPageError("You are not authorized to view this donation.");
      } else if (errObj.response?.status === 404) {
        setPageError("Donation record not found.");
      } else {
        setPageError(
          errObj.response?.data?.message ||
            errObj.message ||
            "Unable to retrieve donation details at this moment."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [donationId, navigate]);

  useEffect(() => {
    fetchStatusAndProject();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [fetchStatusAndProject]);

  // Polling backend status after retry payment submission
  const pollBackendAfterRetry = useCallback(
    async (id: string) => {
      pollCountRef.current += 1;

      try {
        const statusRes = await getDonationStatus(id);

        if (statusRes.status === "SUCCEEDED") {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          navigate(`/donations/${id}/success`);
          return;
        }

        if (statusRes.status === "FAILED" || statusRes.status === "CANCELED") {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          setIsVerifyingAfterRetry(false);
          setRetryClientSecret(null);
          setDonation(statusRes);
          setRetryFeedback(
            statusRes.failureReason ||
              "Your payment retry was not completed. You may try another payment method."
          );
          return;
        }

        // Limit polling to ~30 attempts (approx 60s)
        if (pollCountRef.current >= 30) {
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
          navigate(`/donations/${id}/result`);
          return;
        }

        pollingTimeoutRef.current = setTimeout(() => {
          pollBackendAfterRetryRef.current(id);
        }, 2000);
      } catch (err: unknown) {
        console.warn("Error polling donation status during retry:", err);
        if (pollCountRef.current < 30) {
          pollingTimeoutRef.current = setTimeout(() => {
            pollBackendAfterRetryRef.current(id);
          }, 2000);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    pollBackendAfterRetryRef.current = pollBackendAfterRetry;
  }, [pollBackendAfterRetry]);

  const handleInitiateRetry = async () => {
    if (!donation?.id || isRetrying) return;

    setIsRetrying(true);
    setRetryFeedback(null);

    try {
      const retryResult = await retryDonationPayment(donation.id);

      switch (retryResult.status) {
        case "READY_FOR_PAYMENT":
          if (retryResult.clientSecret) {
            setRetryClientSecret(retryResult.clientSecret);
          } else {
            setRetryFeedback("Payment session could not be refreshed. Please try again later.");
          }
          break;

        case "PROCESSING":
          setIsVerifyingAfterRetry(true);
          setVerificationMessage(
            "Payment is currently processing with your bank. Awaiting confirmation..."
          );
          pollCountRef.current = 0;
          pollBackendAfterRetry(donation.id);
          break;

        case "ALREADY_SUCCEEDED":
          // Special requirement: do NOT show success immediately. Poll backend until status === SUCCEEDED
          setIsVerifyingAfterRetry(true);
          setVerificationMessage(
            "Verifying recent payment confirmation with JanFix community ledger..."
          );
          pollCountRef.current = 0;
          pollBackendAfterRetry(donation.id);
          break;

        case "NOT_RETRYABLE":
          setRetryFeedback(
            retryResult.message ||
              "This donation cannot be retried. The project may no longer be accepting contributions."
          );
          break;
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setRetryFeedback(
        errObj.response?.data?.message ||
          errObj.message ||
          "Failed to initiate payment retry. Please try again."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetryStripeCompleted = () => {
    if (!donation?.id) return;
    setIsVerifyingAfterRetry(true);
    setVerificationMessage("Payment received by Stripe. Verifying with JanFix community ledger...");
    pollCountRef.current = 0;
    pollBackendAfterRetry(donation.id);
  };

  const handleRetryStripeProcessing = () => {
    if (!donation?.id) return;
    setIsVerifyingAfterRetry(true);
    setVerificationMessage("Payment is processing through your bank. Awaiting confirmation...");
    pollCountRef.current = 0;
    pollBackendAfterRetry(donation.id);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 px-4">
          <LoadingState message="Retrieving donation details..." />
        </div>
      </MainLayout>
    );
  }

  if (pageError || !donation) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <ErrorState message={pageError || "Donation information is unavailable."} />
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-red-50/70 to-white pt-10 pb-6 px-6 text-center border-b border-slate-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
              <AlertCircle className="h-10 w-10 text-red-600 animate-in zoom-in duration-300" />
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Payment Was Not Completed
            </h1>

            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We were unable to confirm your contribution. You can review the details below
              and retry your payment securely.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-xs font-semibold text-red-800">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Status: {donation.status}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Retry Feedback Alert if any */}
            {retryFeedback && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <span>{retryFeedback}</span>
              </div>
            )}

            {/* Verification Processing State after retry */}
            {isVerifyingAfterRetry ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Verifying Payment Confirmation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                    {verificationMessage}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>Checking status with server...</span>
                </div>
              </div>
            ) : retryClientSecret ? (
              /* Inline Stripe Payment Element for Retry */
              <div className="rounded-xl bg-slate-50/70 border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    Retry Contribution Checkout
                  </span>
                  <button
                    type="button"
                    onClick={() => setRetryClientSecret(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Cancel Retry
                  </button>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: retryClientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#059669",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <StripeCheckoutForm
                    donationId={donation.id}
                    amountPaise={donation.amountPaise}
                    onPaymentCompleted={handleRetryStripeCompleted}
                    onPaymentProcessing={handleRetryStripeProcessing}
                    onCancel={() => setRetryClientSecret(null)}
                  />
                </Elements>
              </div>
            ) : null}

            {/* Donation Details Card */}
            {!retryClientSecret && !isVerifyingAfterRetry && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Payment Details
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                    <AlertCircle className="h-3 w-3" />
                    NOT COMPLETED
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span>Attempted Contribution</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
                    {formatINRFromPaise(donation.amountPaise)}
                  </span>
                </div>

                {/* Project Title */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-600 text-sm shrink-0">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>Project</span>
                  </div>
                  <Link
                    to={`/issues/${donation.issueId}`}
                    className="text-sm font-semibold text-slate-900 hover:text-emerald-600 text-right line-clamp-2 transition-colors"
                  >
                    {projectTitle}
                  </Link>
                </div>

                {/* Attempt Date */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Attempt Date</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {formatDonationDateTime(donation.createdAt)}
                  </span>
                </div>

                {/* Reference ID */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Hash className="h-4 w-4 text-slate-400" />
                    <span>Reference ID</span>
                  </div>
                  <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {donation.id}
                  </code>
                </div>

                {/* Failure Reason */}
                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Reason for Uncompleted Status
                  </span>
                  <div className="rounded-lg bg-red-50/70 border border-red-200/80 p-3 text-xs sm:text-sm text-red-800 leading-relaxed">
                    {donation.failureReason ||
                      "The payment transaction was not confirmed or was declined by your card issuer. You can retry with the same or another payment method."}
                  </div>
                </div>
              </div>
            )}

            {/* Reassurance Notice */}
            {!retryClientSecret && !isVerifyingAfterRetry && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-3 text-xs text-slate-600">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-800">
                    Safe & Transparent Contributions
                  </span>
                  <p>
                    If your bank deducted funds for a transaction that failed verification,
                    the payment network will automatically release or refund the hold within standard banking timelines.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {!retryClientSecret && !isVerifyingAfterRetry && (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleInitiateRetry}
                  disabled={isRetrying}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Preparing Retry...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Retry Payment</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    to={`/issues/${donation.issueId}`}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
                  >
                    <span>Back to Project</span>
                  </Link>
                  <Link
                    to="/feed"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
                  >
                    <span>Return to Feed</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonationFailurePage;
