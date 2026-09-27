import React from "react";

export interface AdminErrorStateProps {
    message: string;
    className?: string;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
    message,
    className = "",
}) => {
    return (
        <div className={`p-6 ${className}`.trim()}>
            <p className="text-sm text-red-600">{message}</p>
        </div>
    );
};
