import type React from "react";
import DetailSection from "./DetailSection";
import DetailGrid from "./DetailGrid";
import DetailField from "./DetailField";

export interface ProviderIdentityData {
  providerType?: string | null;
  providerName?: string | null;
  responsiblePersonName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ProviderIdentitySectionProps {
  data: ProviderIdentityData;
  icon?: React.ReactNode;
  title?: string;
  variant?: "default" | "card" | "admin";
  className?: string;
}

export function ProviderIdentitySection({
  data,
  icon,
  title = "Identity",
  variant = "default",
  className = "",
}: ProviderIdentitySectionProps) {
  return (
    <DetailSection
      title={title}
      icon={icon}
      variant={variant}
      className={className}
    >
      <DetailGrid columns={2}>
        <DetailField label="Provider Type" value={data.providerType} />
        <DetailField label="Provider Name" value={data.providerName} />
        <DetailField label="Responsible Person" value={data.responsiblePersonName} />
        {data.email !== undefined && (
          <DetailField label="Email" value={data.email} />
        )}
        <DetailField label="Phone" value={data.phone} />
        <DetailField label="Address" value={data.address} fullWidth />
      </DetailGrid>
    </DetailSection>
  );
}

export default ProviderIdentitySection;
