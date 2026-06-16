interface ProviderOnboardingNavbarProps {

    currentStep: 1 | 2 | 3;
}

function ProviderOnboardingNavbar({

    currentStep,

}: ProviderOnboardingNavbarProps) {

    const progressPercentage =

        currentStep === 1
            ? 33
            : currentStep === 2
                ? 66
                : 100;

    return (

        <header className="h-16 border-b bg-white px-6">

            <div className="h-full flex items-center justify-between">

                {/* Left */}

                <h1 className="text-xl font-bold text-blue-600">

                    JanFix

                </h1>

                {/* Center */}

                <div className="hidden md:flex items-center gap-3 w-80">

                    <span className="text-sm text-slate-500">

                        Step {currentStep} of 3

                    </span>

                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">

                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />

                    </div>

                </div>

                {/* Right */}

                <button
                    type="button"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >

                    Save & Exit

                </button>

            </div>

        </header>
    );
}

export default ProviderOnboardingNavbar;