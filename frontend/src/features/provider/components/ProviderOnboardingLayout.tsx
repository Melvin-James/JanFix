import type { ReactNode } from "react";

import ProviderOnboardingSidebar from "./ProviderOnboardingSidebar";

import ProviderOnboardingNavbar from "./ProviderOnboardingNavbar";

interface ProviderOnboardingLayoutProps {

    children: ReactNode;

    currentStep: 1 | 2 | 3;
}

function ProviderOnboardingLayout({

    children,

    currentStep,

}: ProviderOnboardingLayoutProps) {

    return (

        <div className="min-h-screen bg-slate-50">

            {/* Navbar */}

            <ProviderOnboardingNavbar
                currentStep={currentStep}
            />

            <div className="flex">

                {/* Sidebar */}

                <ProviderOnboardingSidebar
                    currentStep={currentStep}
                />

                {/* Page Content */}

                <main className="flex-1 p-8">

                    {children}

                </main>

            </div>

        </div>
    );
}

export default ProviderOnboardingLayout;