import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../store/authStore";
import { logoutUser } from "../../auth/services/authService";

interface ProviderOnboardingNavbarProps {
  currentStep: 1 | 2 | 3;
}

function ProviderOnboardingNavbar({
  currentStep,
}: ProviderOnboardingNavbarProps) {
  const progressPercentage =
    currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="z-30 border-b border-slate-200 bg-white">
      <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:px-0">
        <div className="min-w-0 lg:border-r lg:border-slate-200 lg:px-8">
          <span className="block truncate text-xl font-bold text-blue-600">
            JanFix
          </span>
        </div>

        <div className="hidden min-w-0 items-center gap-3 lg:flex lg:max-w-md lg:px-5">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Provider onboarding progress"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={currentStep}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <span className="shrink-0 text-xs text-slate-500">
            Step {currentStep} of 3
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 lg:mr-8"
        >
          Save &amp; Exit
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 lg:hidden">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Provider onboarding progress"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={currentStep}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <span className="shrink-0 text-xs text-slate-500">
          Step {currentStep} of 3
        </span>
      </div>
    </header>
  );
}

export default ProviderOnboardingNavbar;
