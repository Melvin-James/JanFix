import React from "react";

export interface RejectReasonModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  label?: string;
  placeholder?: string;
  rejectionReason: string;
  rejectError?: string;
  isRejecting?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  maxLength?: number;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  title = "Reject",
  subtitle = "Provide a reason for this rejection.",
  label = "Rejection Reason",
  placeholder = "Explain why this item is being rejected...",
  rejectionReason,
  rejectError,
  isRejecting = false,
  confirmButtonText = "Confirm Rejection",
  cancelButtonText = "Cancel",
  maxLength = 1000,
  onReasonChange,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const currentLength = rejectionReason.length;
  const isOverLimit = maxLength ? currentLength > maxLength : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-slate-700"
            >
              {label}
            </label>
            {maxLength && (
              <span
                className={`text-xs ${
                  isOverLimit ? "font-semibold text-red-600" : "text-slate-400"
                }`}
              >
                {currentLength} / {maxLength}
              </span>
            )}
          </div>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={5}
            placeholder={placeholder}
            maxLength={maxLength ? maxLength + 100 : undefined}
            disabled={isRejecting}
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
          />

          <div className="mt-2 min-h-5">
            {rejectError && (
              <p className="text-sm text-red-600">
                {rejectError}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isRejecting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {cancelButtonText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isRejecting || isOverLimit || !rejectionReason.trim()}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isRejecting ? "Rejecting..." : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReasonModal;
