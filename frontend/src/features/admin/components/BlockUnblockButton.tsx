import React from "react";
import { Ban, Check } from "lucide-react";

export interface BlockUnblockButtonProps {
    status: "ACTIVE" | "BLOCKED" | string;
    onClick: () => void;
    isUpdating?: boolean;
    disabled?: boolean;
    title?: string;
    variant?: "icon" | "bordered";
    className?: string;
}

export const BlockUnblockButton: React.FC<BlockUnblockButtonProps> = ({
    status,
    onClick,
    isUpdating = false,
    disabled = false,
    title,
    variant = "bordered",
    className = "",
}) => {
    const isActive = status === "ACTIVE";
    const defaultTitle = isActive ? "Block" : "Unblock";

    if (variant === "icon") {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled || isUpdating}
                title={title || defaultTitle}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                } ${className}`.trim()}
            >
                {isUpdating ? (
                    <span className="text-xs">...</span>
                ) : isActive ? (
                    <Ban className="h-4 w-4" />
                ) : (
                    <Check className="h-4 w-4" />
                )}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isUpdating}
            title={title || defaultTitle}
            className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            } ${className}`.trim()}
        >
            {isUpdating ? (
                <span className="text-xs">...</span>
            ) : isActive ? (
                <Ban className="size-4" />
            ) : (
                <Check className="size-4" />
            )}
        </button>
    );
};
