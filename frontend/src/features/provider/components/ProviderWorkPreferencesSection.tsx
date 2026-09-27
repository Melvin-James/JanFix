import type React from "react";
import DetailSection from "./DetailSection";
import DetailGrid from "./DetailGrid";
import DetailField from "./DetailField";
import CategoryBadgeList from "./CategoryBadgeList";
import ExternalLinks from "./ExternalLinks";

export interface ProviderWorkPreferencesData {
  categoriesWillingToWork?: string[] | null;
  websiteLinks?: string[] | null;
}

export interface ProviderWorkPreferencesSectionProps {
  data: ProviderWorkPreferencesData;
  icon?: React.ReactNode;
  title?: string;
  variant?: "default" | "card" | "admin";
  className?: string;
}

export function ProviderWorkPreferencesSection({
  data,
  icon,
  title = "Work Preferences",
  variant = "default",
  className = "",
}: ProviderWorkPreferencesSectionProps) {
  return (
    <DetailSection
      title={title}
      icon={icon}
      variant={variant}
      className={className}
    >
      <DetailGrid columns={2}>
        <DetailField label="Categories Willing to Work">
          <CategoryBadgeList categories={data.categoriesWillingToWork} />
        </DetailField>

        <DetailField label="Website / Social Links">
          <ExternalLinks links={data.websiteLinks} />
        </DetailField>
      </DetailGrid>
    </DetailSection>
  );
}

export default ProviderWorkPreferencesSection;
