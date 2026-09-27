import React from "react";

export type StatusBadgeVariant =
    | "emerald"
    | "red"
    | "amber"
    | "slate"
    | "success"
    | "danger"
    | "warning"
    | "neutral";

export interface StatusBadgeProps {
    label?: React.ReactNode;
    status?: string;
    variant?: StatusBadgeVariant;
    className?: string;
}

const variantStyles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    success: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    danger: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    warning: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
    neutral: "bg-slate-100 text-slate-700",
};

function getVariantFromStatus(status?: string): StatusBadgeVariant {
    if (!status) return "slate";
    const normalized = status.toUpperCase();
    if (normalized === "ACTIVE" || normalized === "VERIFIED" || normalized === "APPROVED") {
        return "emerald";
    }
    if (normalized === "BLOCKED" || normalized === "REJECTED") {
        return "red";
    }
    if (
        normalized === "NOT_VERIFIED" ||
        normalized === "SUBMITTED" ||
        normalized === "UNDER_REVIEW" ||
        normalized === "PENDING"
    ) {
        return "amber";
    }
    return "slate";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    label,
    status,
    variant,
    className = "",
}) => {
    const activeVariant = variant || getVariantFromStatus(status);
    const styles = variantStyles[activeVariant] || variantStyles.slate;
    const displayText = label ?? status ?? "";

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles} ${className}`.trim()}
        >
            {displayText}
        </span>
    );
};
