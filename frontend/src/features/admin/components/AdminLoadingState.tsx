import React from "react";

export interface AdminLoadingStateProps {
    message?: string;
    className?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
    message = "Loading...",
    className = "",
}) => {
    return (
        <div className={`p-6 ${className}`.trim()}>
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
};
