import React from "react";

export interface AdminFilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
    children,
    className = "",
}) => {
    return (
        <div className={`flex flex-col gap-3 lg:flex-row lg:items-center ${className}`.trim()}>
            {children}
        </div>
    );
};
