import React from "react";

export interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    startIndex?: number;
    endIndex?: number;
    totalItems?: number;
    className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalItems,
    className = "",
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const showDetails =
        startIndex !== undefined && endIndex !== undefined && totalItems !== undefined;

    return (
        <div
            className={`flex items-center justify-between border-t border-slate-200 px-6 py-4 ${className}`.trim()}
        >
            {showDetails ? (
                <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
                </p>
            ) : (
                <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                </p>
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Previous
                </button>

                {showDetails && (
                    <span className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>
                )}

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
