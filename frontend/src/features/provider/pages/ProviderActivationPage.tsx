import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  Building2,
  CreditCard,
  User,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../../../store/authStore";
import { activateProvider } from "../services/providerService";
import { switchMode } from "../../auth/services/authService";
import {
  providerActivationSchema,
  type ProviderActivationFormData,
} from "../validations/providerActivationSchema";

export default function ProviderActivationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderActivationFormData>({
    resolver: zodResolver(providerActivationSchema),
    defaultValues: {
      accountHolderName: user?.providerProfile?.identity?.providerName || user?.fullName || "",
      upiId: "",
      bankAccountNumber: "",
      ifscCode: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ProviderActivationFormData) => {
    if (isActivating) return;
    setIsActivating(true);
    setActivationError(null);

    try {
      const response = await activateProvider(data);
      setUser(response.data.user);
      toast.success("Provider account activated successfully!");
      navigate("/provider/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Activation failed:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to activate provider account. Please verify your payout details and try again.";
      setActivationError(message || "Activation failed.");
    } finally {
      setIsActivating(false);
    }
  };

  const handleReturnToUserMode = async () => {
    if (isReturning) return;
    setIsReturning(true);

    try {
      const response = await switchMode("USER");
      setUser(response.data.user);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Failed to switch to user mode:", err);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs mb-4 border border-emerald-100">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Activate Your Provider Account
            </h1>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Complete your provider activation by adding the payout details required to receive payments for your work.
            </p>
          </div>

          {/* Context Notice */}
          <div className="mt-6 rounded-xl bg-blue-50/70 border border-blue-100 p-4 text-xs text-blue-900 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-950">First-Time Provider Activation</p>
              <p className="text-blue-800 leading-relaxed">
                Your provider application has been approved! To safeguard community payments and ensure reliable disbursements, providing valid payout details is mandatory before accessing the Service Provider Workspace.
              </p>
            </div>
          </div>

          {activationError && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{activationError}</span>
            </div>
          )}

          {/* Activation Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {/* Section 1: Account Holder Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">Account Holder Details</h2>
              </div>

              <div>
                <label htmlFor="accountHolderName" className="block text-xs font-medium text-slate-700 mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountHolderName"
                  type="text"
                  placeholder="e.g. John Doe or Green Earth Foundation"
                  {...register("accountHolderName")}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.accountHolderName
                      ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                />
                {errors.accountHolderName ? (
                  <p className="mt-1.5 text-xs text-red-600">{errors.accountHolderName.message}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Must match the legal name on your bank account or registered organization name.
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: UPI Payment Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">UPI Payment Details</h2>
              </div>

              <div>
                <label htmlFor="upiId" className="block text-xs font-medium text-slate-700 mb-1">
                  UPI ID (VPA) <span className="text-red-500">*</span>
                </label>
                <input
                  id="upiId"
                  type="text"
                  placeholder="e.g. name@okhdfcbank or 9876543210@upi"
                  {...register("upiId")}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.upiId
                      ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                />
                {errors.upiId ? (
                  <p className="mt-1.5 text-xs text-red-600">{errors.upiId.message}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Required for direct, instant compensation transfers. Format validation confirms structure only and does not confirm account ownership.
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Optional Bank Account Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Bank Account Details</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Optional
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Provide traditional bank account details if you prefer direct NEFT/RTGS transfers. If either field is filled, both account number and IFSC code are required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bankAccountNumber" className="block text-xs font-medium text-slate-700 mb-1">
                    Bank Account Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="bankAccountNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="9 to 18 digits"
                    {...register("bankAccountNumber")}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.bankAccountNumber
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  />
                  {errors.bankAccountNumber && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.bankAccountNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ifscCode" className="block text-xs font-medium text-slate-700 mb-1">
                    IFSC Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="ifscCode"
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    {...register("ifscCode")}
                    onChange={(e) => {
                      setValue("ifscCode", e.target.value.toUpperCase(), { shouldValidate: true });
                    }}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.ifscCode
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  />
                  {errors.ifscCode && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.ifscCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms / Security Note */}
            <div className="flex items-start gap-2.5 text-xs text-slate-500 px-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your payout details are encrypted and securely stored. JanFix will use these details strictly for releasing funds upon successful civic issue resolution.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isActivating || isReturning}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isActivating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span>{isActivating ? "Activating Provider Account..." : "Save Payout Details & Activate"}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleReturnToUserMode}
                  disabled={isActivating || isReturning}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isReturning ? "Returning..." : "Return to User Mode for now"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
