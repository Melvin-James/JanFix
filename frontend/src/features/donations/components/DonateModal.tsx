import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  X,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  createDonationIntent,
  retryDonationPayment,
  getDonationStatus,
} from "../services/donationService";
import { StripeCheckoutForm } from "./StripeCheckoutForm";

// Initialize Stripe outside component render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface DonateModalProps {
  issueId: string;
  issueTitle: string;
  fundingTargetRupees?: number;
  amountRaisedRupees?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500];

export const DonateModal: React.FC<DonateModalProps> = ({
  issueId,
  issueTitle,
  fundingTargetRupees = 0,
  amountRaisedRupees = 0,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<
    "AMOUNT" | "CHECKOUT" | "PROCESSING" | "FAILED" | "SUCCESS"
  >("AMOUNT");
  const [selectedRupees, setSelectedRupees] = useState<number>(500);
  const [customRupees, setCustomRupees] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active donation session state
  const [activeDonationId, setActiveDonationId] = useState<string | null>(null);
  const [activeClientSecret, setActiveClientSecret] = useState<string | null>(null);
  const [activeAmountPaise, setActiveAmountPaise] = useState<number>(0);
  const [processingMessage, setProcessingMessage] = useState<string>(
    "Awaiting confirmation from Stripe payment network..."
  );

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef<number>(0);

  // Clear polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentAmountRupees = customRupees
    ? parseFloat(customRupees) || 0
    : selectedRupees;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const remainingRupees = Math.max(0, fundingTargetRupees - amountRaisedRupees);

  const handlePresetSelect = (amount: number) => {
    setSelectedRupees(amount);
    setCustomRupees("");
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomRupees(val);
    setErrorMessage(null);
  };

  const handleProceedToPayment = async () => {
    if (currentAmountRupees < 1) {
      setErrorMessage("Please enter an amount of at least ₹1.00.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const amountPaise = Math.round(currentAmountRupees * 100);

    try {
      const session = await createDonationIntent({
        issueId,
        amountPaise,
        isAnonymous,
        message: message.trim() ? message.trim() : undefined,
      });

      setActiveDonationId(session.donationId);
      setActiveClientSecret(session.clientSecret);
      setActiveAmountPaise(session.amountPaise);
      setStep("CHECKOUT");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to initialize payment session. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll backend status to guarantee webhook has processed and confirmed SUCCEEDED
  const pollBackendDonationStatus = async (donationId: string) => {
    pollCountRef.current += 1;

    try {
      const statusRes = await getDonationStatus(donationId);

      if (statusRes.status === "SUCCEEDED") {
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        setStep("SUCCESS");
        onSuccess();
        return;
      }

      if (statusRes.status === "FAILED") {
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        setErrorMessage(
          statusRes.failureReason ||
            "Payment failed. You can retry with another payment method."
        );
        setStep("FAILED");
        return;
      }

      if (statusRes.status === "CANCELED") {
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        setErrorMessage("Payment was canceled. You can try again.");
        setStep("FAILED");
        return;
      }

      // Max 12 polling attempts (approx 24 seconds)
      if (pollCountRef.current >= 12) {
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        setProcessingMessage(
          "Payment verification is taking a little longer than usual. Your contribution has been registered and will be verified automatically."
        );
        return;
      }

      // Continue polling every 2 seconds
      pollingTimeoutRef.current = setTimeout(() => {
        pollBackendDonationStatus(donationId);
      }, 2000);
    } catch (err: any) {
      console.warn("Error polling donation status:", err);
      // Still retry a couple times in case of transient network glitch
      if (pollCountRef.current < 12) {
        pollingTimeoutRef.current = setTimeout(() => {
          pollBackendDonationStatus(donationId);
        }, 2000);
      }
    }
  };

  const handleStripePaymentCompleted = (_paymentIntentId: string) => {
    if (!activeDonationId) return;

    setStep("PROCESSING");
    setProcessingMessage(
      "Verifying payment confirmation with JanFix community ledger..."
    );
    pollCountRef.current = 0;
    pollBackendDonationStatus(activeDonationId);
  };

  const handleStripePaymentProcessing = (_paymentIntentId: string) => {
    if (!activeDonationId) return;

    setStep("PROCESSING");
    setProcessingMessage(
      "Payment is processing through your bank. We are awaiting final authorization..."
    );
    pollCountRef.current = 0;
    pollBackendDonationStatus(activeDonationId);
  };

  const handleRetryPayment = async () => {
    if (!activeDonationId) return;

    setIsRetrying(true);
    setErrorMessage(null);

    try {
      const retryResult = await retryDonationPayment(activeDonationId);

      switch (retryResult.status) {
        case "READY_FOR_PAYMENT":
          if (retryResult.clientSecret) {
            setActiveClientSecret(retryResult.clientSecret);
            setStep("CHECKOUT");
          } else {
            setErrorMessage("Payment session could not be refreshed.");
          }
          break;

        case "ALREADY_SUCCEEDED":
          setStep("SUCCESS");
          onSuccess();
          break;

        case "PROCESSING":
          setStep("PROCESSING");
          setProcessingMessage(
            "Payment is currently processing. Awaiting webhook confirmation..."
          );
          pollCountRef.current = 0;
          pollBackendDonationStatus(activeDonationId);
          break;

        case "NOT_RETRYABLE":
          setErrorMessage(
            retryResult.message ||
              "This donation cannot be retried. Please initiate a new donation."
          );
          break;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to retry payment. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClose = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    setStep("AMOUNT");
    setActiveDonationId(null);
    setActiveClientSecret(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Heart className="h-5 w-5 text-emerald-600 fill-emerald-100" />
            <span>Community Donation</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === "AMOUNT" && (
            <div className="space-y-5">
              {/* Context Summary */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Supporting Project
                </p>
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                  {issueTitle}
                </h3>
                {fundingTargetRupees > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                    <span>
                      Target: <strong>{formatINR(fundingTargetRupees)}</strong>
                    </span>
                    <span>
                      Remaining:{" "}
                      <strong className="text-emerald-700">
                        {formatINR(remainingRupees)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Preset selection */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Select Donation Amount:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                        selectedRupees === amt && !customRupees
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Or Enter Custom Amount (₹):
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={customRupees}
                    onChange={handleCustomChange}
                    placeholder="e.g. 750"
                    className="block w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Anonymous check */}
              <label className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">
                    Donate anonymously
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Your name will be masked as &quot;Anonymous&quot; on the public
                    contributors list.
                  </p>
                </div>
              </label>

              {/* Encouragement message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Encouraging Message (Optional):
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  placeholder="Leave a word of encouragement for the community..."
                  className="block w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting || currentAmountRupees < 1}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Preparing Payment Session...</span>
                    </>
                  ) : (
                    <span>Proceed to Pay {formatINR(currentAmountRupees)}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "CHECKOUT" && activeClientSecret && (
            <div className="space-y-4">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: activeClientSecret,
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
                  amountPaise={activeAmountPaise}
                  onPaymentCompleted={handleStripePaymentCompleted}
                  onPaymentProcessing={handleStripePaymentProcessing}
                  onCancel={() => setStep("AMOUNT")}
                />
              </Elements>
            </div>
          )}

          {step === "PROCESSING" && (
            <div className="py-8 text-center space-y-5">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 text-amber-600 mx-auto">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Processing Contribution
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {processingMessage}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Checking payment verification with server...</span>
              </div>
            </div>
          )}

          {step === "FAILED" && (
            <div className="py-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mx-auto">
                <AlertCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Payment Was Not Completed
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {errorMessage ||
                    "We were unable to verify your payment. Your card was not charged or the transaction was declined."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Retry Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "SUCCESS" && (
            <div className="py-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Thank You for Your Support!
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your contribution of{" "}
                  <strong className="text-emerald-700 font-bold font-mono">
                    {formatINR(activeAmountPaise / 100 || currentAmountRupees)}
                  </strong>{" "}
                  has been verified and credited towards this civic project.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close & View Contributors
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {step !== "SUCCESS" && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Stripe Test Mode Integration &bull; Powered by JanFix</span>
          </div>
        )}
      </div>
    </div>
  );
};
