import type React from "react";
import DetailSection from "./DetailSection";
import DetailGrid from "./DetailGrid";
import DetailField from "./DetailField";

export interface ProviderStatusData {
  applicationStatus?: string | null;
  providerStatus?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface ProviderStatusSectionProps {
  status: ProviderStatusData;
  icon?: React.ReactNode;
  title?: string;
  variant?: "default" | "card" | "admin";
  className?: string;
}

const formatDate = (dateStr?: string | null, fallback = "Not reviewed") => {
  if (!dateStr) return fallback;
  try {
    return new Date(dateStr).toLocaleString("en-IN");
  } catch {
    return dateStr;
  }
};

export function ProviderStatusSection({
  status,
  icon,
  title = "Application Status",
  variant = "default",
  className = "",
}: ProviderStatusSectionProps) {
  const {
    applicationStatus,
    providerStatus,
    submittedAt,
    reviewedAt,
    rejectionReason,
  } = status;

  return (
    <DetailSection
      title={title}
      icon={icon}
      variant={variant}
      className={className}
    >
      <DetailGrid columns={providerStatus ? 2 : 3}>
        {applicationStatus && (
          <DetailField label="Application Status">
            <span className="font-medium text-slate-900">
              {applicationStatus}
            </span>
          </DetailField>
        )}

        {providerStatus && (
          <DetailField label="Provider Status">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                providerStatus === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {providerStatus}
            </span>
          </DetailField>
        )}

        {submittedAt && (
          <DetailField label="Submitted">
            <span>{formatDate(submittedAt, "—")}</span>
          </DetailField>
        )}

        {reviewedAt !== undefined && (
          <DetailField label="Reviewed">
            <span>{formatDate(reviewedAt, "Not reviewed")}</span>
          </DetailField>
        )}

        {rejectionReason && (
          <DetailField label="Rejection Reason" fullWidth>
            <p className="text-red-700 font-medium">{rejectionReason}</p>
          </DetailField>
        )}
      </DetailGrid>
    </DetailSection>
  );
}

export default ProviderStatusSection;
