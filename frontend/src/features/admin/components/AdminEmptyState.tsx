import React from "react";

export interface AdminEmptyStateProps {
    message?: string;
    className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
    message = "No data found.",
    className = "",
}) => {
    return (
        <div className={`px-6 py-12 text-center ${className}`.trim()}>
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
};
