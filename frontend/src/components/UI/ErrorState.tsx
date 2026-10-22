import React from "react";

export interface ErrorStateProps {
    message: string;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message,
    className = "",
}) => {
    return (
        <div className={`p-6 ${className}`.trim()}>
            <p className="text-sm text-red-600">{message}</p>
        </div>
    );
};

export default ErrorState;
