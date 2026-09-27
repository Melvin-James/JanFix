import type React from "react";
import type { UploadedFile } from "../types/uploadedFile";
import DetailSection from "./DetailSection";
import DetailGrid from "./DetailGrid";
import DetailField from "./DetailField";
import UploadedFileView from "./UploadedFileView";

export interface ProviderDocumentsData {
  identityProof?: UploadedFile | null;
  profileImage?: UploadedFile | null;
  previousCommunityPhotos?: UploadedFile[] | null;
  ngoRegistrationDocument?: UploadedFile | null;
  logo?: UploadedFile | null;
}

export interface ProviderDocumentsSectionProps {
  documents: ProviderDocumentsData;
  providerType?: string | null;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: "default" | "card" | "admin";
  fileVariant?: "link" | "button";
  className?: string;
}

export function ProviderDocumentsSection({
  documents,
  providerType,
  icon,
  title = "Documents",
  subtitle,
  variant = "default",
  fileVariant = "link",
  className = "",
}: ProviderDocumentsSectionProps) {
  const showNgoDoc = providerType === "NGO" || Boolean(documents.ngoRegistrationDocument);
  const showLogo = providerType === "NGO" || providerType === "VOLUNTEER_GROUP" || Boolean(documents.logo);

  return (
    <DetailSection
      title={title}
      subtitle={subtitle}
      icon={icon}
      variant={variant}
      className={className}
    >
      <DetailGrid columns={2}>
        <DetailField label="Identity Proof">
          <UploadedFileView
            file={documents.identityProof}
            variant={fileVariant}
            label={fileVariant === "button" ? "View Identity Proof" : undefined}
          />
        </DetailField>

        <DetailField label="Profile Image">
          <UploadedFileView
            file={documents.profileImage}
            variant={fileVariant}
            label={fileVariant === "button" ? "View Profile Image" : undefined}
          />
        </DetailField>

        <DetailField label="Previous Community Photos" fullWidth>
          {documents.previousCommunityPhotos && documents.previousCommunityPhotos.length > 0 ? (
            <div className="space-y-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {documents.previousCommunityPhotos.map((photo, index) => (
                <UploadedFileView
                  key={photo.key ?? photo.url ?? index}
                  file={photo}
                  variant={fileVariant}
                  label={fileVariant === "button" ? `View Community Photo ${index + 1}` : undefined}
                />
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-400">No community photos provided.</span>
          )}
        </DetailField>

        {showNgoDoc && (
          <DetailField label="NGO Registration Document">
            <UploadedFileView
              file={documents.ngoRegistrationDocument}
              variant={fileVariant}
              label={fileVariant === "button" ? "View Registration Document" : undefined}
            />
          </DetailField>
        )}

        {showLogo && (
          <DetailField label="Logo">
            <UploadedFileView
              file={documents.logo}
              variant={fileVariant}
              label={fileVariant === "button" ? "View Logo" : undefined}
            />
          </DetailField>
        )}
      </DetailGrid>
    </DetailSection>
  );
}

export default ProviderDocumentsSection;
