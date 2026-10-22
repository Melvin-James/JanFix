import React from "react";
import LoadingSpinner from "../LoadingSpinner";

export interface LoadingStateProps {
    message?: string;
    className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = "Loading...",
    className = "",
}) => {
    return (
        <div className={`flex items-center justify-center gap-2 p-6 text-slate-500 ${className}`.trim()}>
            <LoadingSpinner size="sm" fullScreen={false} />
            <span className="text-sm">{message}</span>
        </div>
    );
};

export default LoadingState;
