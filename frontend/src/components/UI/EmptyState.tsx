import React from "react";

export interface EmptyStateProps {
    message?: string;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    message = "No data found.",
    className = "",
}) => {
    return (
        <div className={`px-6 py-12 text-center ${className}`.trim()}>
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
};

export default EmptyState;
