import React from "react";

export interface AdminPageHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    description,
    className = "",
}) => {
    return (
        <div className={`mb-6 ${className}`.trim()}>
            <h1 className="text-2xl font-semibold text-slate-900">
                {title}
            </h1>
            {description && (
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
};
