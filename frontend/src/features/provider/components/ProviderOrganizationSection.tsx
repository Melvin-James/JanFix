import type React from "react";
import type { UploadedFile } from "../types/uploadedFile";
import DetailSection from "./DetailSection";
import DetailGrid from "./DetailGrid";
import DetailField from "./DetailField";
import UploadedFileView from "./UploadedFileView";

export interface ProviderOrganizationData {
  providerType?: string | null;
  volunteerGroupProfile?: {
    memberCount: number;
    logo?: UploadedFile | null;
  } | null;
  organizationProfile?: {
    memberCount: number;
    ngoRegistrationDocument?: UploadedFile | null;
    logo?: UploadedFile | null;
  } | null;
  documents?: {
    ngoRegistrationDocument?: UploadedFile | null;
    logo?: UploadedFile | null;
  } | null;
}

export interface ProviderOrganizationSectionProps {
  data: ProviderOrganizationData;
  icon?: React.ReactNode;
  title?: string;
  variant?: "default" | "card" | "admin";
  fileVariant?: "link" | "button";
  className?: string;
}

export function ProviderOrganizationSection({
  data,
  icon,
  title,
  variant = "default",
  fileVariant = "link",
  className = "",
}: ProviderOrganizationSectionProps) {
  const { volunteerGroupProfile, organizationProfile, documents } = data;

  if (!volunteerGroupProfile && !organizationProfile) {
    return null;
  }

  if (volunteerGroupProfile) {
    const groupLogo = volunteerGroupProfile.logo || documents?.logo;
    const sectionTitle = title ?? "Volunteer Group Details";

    return (
      <DetailSection
        title={sectionTitle}
        icon={icon}
        variant={variant}
        className={className}
      >
        <DetailGrid columns={2}>
          <DetailField label="Member Count" value={volunteerGroupProfile.memberCount} />
          {groupLogo && (
            <DetailField label="Group Logo">
              <UploadedFileView file={groupLogo} variant={fileVariant} />
            </DetailField>
          )}
        </DetailGrid>
      </DetailSection>
    );
  }

  if (organizationProfile) {
    const ngoDoc = organizationProfile.ngoRegistrationDocument || documents?.ngoRegistrationDocument;
    const ngoLogo = organizationProfile.logo || documents?.logo;
    const sectionTitle = title ?? "Organization Details";

    return (
      <DetailSection
        title={sectionTitle}
        icon={icon}
        variant={variant}
        className={className}
      >
        <DetailGrid columns={2}>
          <DetailField label="Member Count" value={organizationProfile.memberCount} />
          {ngoDoc && (
            <DetailField label="NGO Registration" value="NGO Registration Document">
              <UploadedFileView file={ngoDoc} variant={fileVariant} />
            </DetailField>
          )}
          {ngoLogo && (
            <DetailField label="NGO Logo">
              <UploadedFileView file={ngoLogo} variant={fileVariant} />
            </DetailField>
          )}
        </DetailGrid>
      </DetailSection>
    );
  }

  return null;
}

export default ProviderOrganizationSection;
