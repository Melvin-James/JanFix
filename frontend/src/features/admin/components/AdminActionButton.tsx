import React from "react";

export interface AdminActionButtonProps {
    onClick?: () => void;
    icon?: React.ReactNode;
    label?: string;
    title?: string;
    disabled?: boolean;
    variant?: "outline" | "ghost" | "danger" | "success";
    className?: string;
    children?: React.ReactNode;
}

export const AdminActionButton: React.FC<AdminActionButtonProps> = ({
    onClick,
    icon,
    label,
    title,
    disabled = false,
    variant = "outline",
    className = "",
    children,
}) => {
    let baseStyles =
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

    if (variant === "outline") {
        baseStyles += " border border-slate-300 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100";
    } else if (variant === "danger") {
        baseStyles += " border border-red-200 px-2.5 py-1.5 text-red-600 hover:bg-red-50";
    } else if (variant === "success") {
        baseStyles += " border border-emerald-200 px-2.5 py-1.5 text-emerald-600 hover:bg-emerald-50";
    } else if (variant === "ghost") {
        baseStyles += " h-8 w-8 text-slate-600 hover:bg-slate-100";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${className}`.trim()}
        >
            {icon && <span className={label || children ? "mr-2" : ""}>{icon}</span>}
            {label || children}
        </button>
    );
};
