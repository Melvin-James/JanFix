import type { ReactNode } from "react";

interface ProviderTypeCardProps {

    title: string;

    description: string;

    icon: ReactNode;

    selected: boolean;

    onClick: () => void;
}

function ProviderTypeCard({

    title,

    description,

    icon,

    selected,

    onClick,

}: ProviderTypeCardProps) {

    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                w-full rounded-xl border-2 p-5 text-left transition-all

                ${selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }
            `}
        >

            <div className="flex items-start gap-4">

                <div className="text-blue-600">

                    {icon}

                </div>

                <div>

                    <h3 className="font-semibold text-slate-900">

                        {title}

                    </h3>

                    <p className="mt-1 text-sm text-slate-500">

                        {description}

                    </p>

                </div>

            </div>

        </button>
    );
}

export default ProviderTypeCard;