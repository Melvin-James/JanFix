import { BadgeCheck, Eye, Sparkles } from "lucide-react";

interface ProviderOnboardingSidebarProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  {
    number: 1 as const,
    label: "Participation",
    Icon: Sparkles,
  },
  {
    number: 2 as const,
    label: "Profile setup",
    Icon: BadgeCheck,
  },
  {
    number: 3 as const,
    label: "Review and submit",
    Icon: Eye,
  },
];

function ProviderOnboardingSidebar({
  currentStep,
}: ProviderOnboardingSidebarProps) {
  return (
    <aside
      aria-label="Provider onboarding steps"
      className="border-b border-slate-200 bg-blue-50/70 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <nav className="overflow-x-auto p-3 sm:p-4 lg:sticky lg:top-0 lg:p-5">
        <ol className="grid min-w-max grid-cols-3 gap-2 lg:min-w-0 lg:grid-cols-1 lg:gap-3">
          {steps.map(({ number, label, Icon }) => {
            const isActive = currentStep === number;
            const isComplete = currentStep > number;

            return (
              <li key={number}>
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors lg:min-h-14 lg:px-4 ${
                    isActive
                      ? "bg-blue-600 font-medium text-white shadow-sm"
                      : isComplete
                        ? "font-medium text-blue-700"
                        : "text-slate-600"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

export default ProviderOnboardingSidebar;
