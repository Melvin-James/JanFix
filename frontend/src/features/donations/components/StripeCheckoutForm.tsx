import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface StripeCheckoutFormProps {
  donationId: string;
  amountPaise: number;
  onPaymentCompleted: (paymentIntentId: string) => void;
  onPaymentProcessing: (paymentIntentId: string) => void;
  onPaymentFailed?: (errorMessage: string) => void;
  onCancel: () => void;
}

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  donationId,
  amountPaise,
  onPaymentCompleted,
  onPaymentProcessing,
  onPaymentFailed,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donations/${donationId}/result`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        const errorMsg =
          result.error.message ||
          "An error occurred during payment processing. Please try again.";
        setErrorMessage(errorMsg);
        onPaymentFailed?.(errorMsg);
        setIsLoading(false);
      } else if (result.paymentIntent) {
        switch (result.paymentIntent.status) {
          case "succeeded":
            onPaymentCompleted(result.paymentIntent.id);
            break;
          case "processing":
            onPaymentProcessing(result.paymentIntent.id);
            break;
          case "requires_payment_method": {
            const declineMsg =
              result.paymentIntent.last_payment_error?.message ||
              "Your payment was declined. Please try another card or payment method.";
            setErrorMessage(declineMsg);
            onPaymentFailed?.(declineMsg);
            setIsLoading(false);
            break;
          }
          case "requires_action":
            // 3D Secure or other customer action in progress
            setIsLoading(false);
            break;
          default: {
            onPaymentProcessing(result.paymentIntent.id);
            break;
          }
        }
      } else {
        // Unexpected state without paymentIntent
        setErrorMessage("Unexpected payment confirmation response. Please try again.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const exceptionMsg =
        error?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(exceptionMsg);
      onPaymentFailed?.(exceptionMsg);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
        <span className="text-xs text-emerald-800 font-medium">
          Total Contribution Amount:
        </span>
        <div className="text-2xl font-bold text-emerald-900 mt-0.5 font-mono">
          {formatINR(amountPaise)}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stripe Payment Element container with responsive styling */}
      <div className="p-1 min-h-[220px]">
        <PaymentElement />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Secured by Stripe Test Mode. No real money will be charged.</span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying with Stripe...</span>
            </>
          ) : (
            <span>Pay {formatINR(amountPaise)}</span>
          )}
        </button>
      </div>
    </form>
  );
};
