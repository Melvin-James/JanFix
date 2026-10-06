import type { ReactNode } from "react";

import ProviderOnboardingFooter from "./ProviderOnboardingFooter";
import ProviderOnboardingNavbar from "./ProviderOnboardingNavbar";
import ProviderOnboardingSidebar from "./ProviderOnboardingSidebar";

interface ProviderOnboardingLayoutProps {
  children: ReactNode;
  currentStep: 1 | 2 | 3;
}

function ProviderOnboardingLayout({
  children,
  currentStep,
}: ProviderOnboardingLayoutProps) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-[#f8faff] text-slate-900">
      <ProviderOnboardingNavbar currentStep={currentStep} />

      <div className="min-w-0 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <ProviderOnboardingSidebar currentStep={currentStep} />

        <main className="min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>

      <ProviderOnboardingFooter />
    </div>
  );
}

export default ProviderOnboardingLayout;
