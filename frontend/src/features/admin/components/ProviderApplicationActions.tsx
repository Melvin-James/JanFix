import { StatusBadge } from "./StatusBadge";

export interface ProviderApplicationActionsProps {
  status: string;
  isApproving?: boolean;
  isRejecting?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ProviderApplicationActions({
  status,
  isApproving = false,
  isRejecting = false,
  onApprove,
  onReject,
}: ProviderApplicationActionsProps) {
  const isFinalized = status === "APPROVED" || status === "REJECTED";

  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={status} />

      {!isFinalized && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isApproving ? "Approving..." : "Approve Application"}
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={isApproving || isRejecting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors cursor-pointer"
          >
            Reject Application
          </button>
        </div>
      )}
    </div>
  );
}

export default ProviderApplicationActions;
