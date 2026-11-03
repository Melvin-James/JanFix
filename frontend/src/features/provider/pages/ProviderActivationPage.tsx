import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { activateProvider } from "../services/providerService";
import { switchMode } from "../../auth/services/authService";

export default function ProviderActivationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const handleActivate = async () => {
    if (isActivating) return;
    setIsActivating(true);
    setActivationError(null);

    try {
      const response = await activateProvider();
      setUser(response.data.user);
      navigate("/provider/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Activation failed:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to activate provider account. Please try again.";
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs mb-6 border border-emerald-100">
          <ShieldCheck className="h-9 w-9" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          You are now a verified service provider.
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Congratulations {user?.fullName ? `, ${user.fullName}` : ""}! Your provider application has been approved. Activate your provider account below to start browsing eligible civic issues and expressing interest in community solutions.
        </p>

        {/* Features / Benefits Summary */}
        <div className="my-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-left">
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full access to the Service Provider Workspace</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Browse verified community civic issues</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Express interest in issues matching your expertise</span>
            </li>
          </ul>
        </div>

        {activationError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {activationError}
          </div>
        )}

        {/* Activation Action Button */}
        <button
          type="button"
          onClick={handleActivate}
          disabled={isActivating || isReturning}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {isActivating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          <span>{isActivating ? "Activating Account..." : "Activate Provider Account"}</span>
        </button>

        {/* Return to User Mode */}
        <div className="mt-4">
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
    </div>
  );
}
