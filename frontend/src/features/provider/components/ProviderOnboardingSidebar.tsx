interface ProviderOnboardingSidebarProps {

    currentStep: 1 | 2 | 3;
}

function ProviderOnboardingSidebar({

    currentStep,

}: ProviderOnboardingSidebarProps) {

    return (

        <aside className="w-72 min-h-[calc(100vh-64px)] border-r bg-white p-6">

            <h2 className="mb-6 text-sm font-semibold text-slate-500 uppercase tracking-wide">

                Provider Onboarding

            </h2>

            <div className="space-y-6">

                <div>

                    <div
                        className={
                            currentStep === 1
                                ? "font-semibold text-blue-600"
                                : "text-slate-700"
                        }
                    >
                        1. Provider Type
                    </div>

                    <p className="mt-1 text-xs text-slate-500">

                        Choose how you'll operate

                    </p>

                </div>

                <div>

                    <div
                        className={
                            currentStep === 2
                                ? "font-semibold text-blue-600"
                                : "text-slate-700"
                        }
                    >
                        2. Profile Setup
                    </div>

                    <p className="mt-1 text-xs text-slate-500">

                        Details & Documents

                    </p>

                </div>

                <div>

                    <div
                        className={
                            currentStep === 3
                                ? "font-semibold text-blue-600"
                                : "text-slate-700"
                        }
                    >
                        3. Review & Submit
                    </div>

                    <p className="mt-1 text-xs text-slate-500">

                        Final verification

                    </p>

                </div>

            </div>

        </aside>
    );
}

export default ProviderOnboardingSidebar;