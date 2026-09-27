import React from "react";

export interface AdminCardProps {
    children: React.ReactNode;
    className?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
    children,
    className = "",
}) => {
    return (
        <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`.trim()}>
            {children}
        </div>
    );
};
