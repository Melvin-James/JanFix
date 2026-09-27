
export interface RejectApplicationModalProps {
  isOpen: boolean;
  rejectionReason: string;
  rejectError?: string;
  isRejecting?: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RejectApplicationModal({
  isOpen,
  rejectionReason,
  rejectError,
  isRejecting = false,
  onReasonChange,
  onClose,
  onConfirm,
}: RejectApplicationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Reject Provider Application
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Provide a reason for rejecting this application.
          </p>
        </div>

        <div className="px-6 py-5">
          <label
            htmlFor="rejectionReason"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Rejection Reason
          </label>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={5}
            placeholder="Explain why this application is being rejected..."
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isRejecting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectApplicationModal;
