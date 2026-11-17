import React, { useState } from "react";
import {
  User,
  Building,
  Users,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  FileCheck,
} from "lucide-react";
import type { ServiceProviderDetails } from "../types/ServiceProviderDetails";
import ProviderIdentitySection from "../../provider/components/ProviderIdentitySection";
import ProviderDocumentsSection from "../../provider/components/ProviderDocumentsSection";
import ProviderWorkPreferencesSection from "../../provider/components/ProviderWorkPreferencesSection";
import ProviderOrganizationSection from "../../provider/components/ProviderOrganizationSection";
import { StatusBadge } from "./StatusBadge";

interface AdminProviderProfileCardProps {
  provider: ServiceProviderDetails;
}

export const AdminProviderProfileCard: React.FC<AdminProviderProfileCardProps> = ({
  provider,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const providerType = provider.identity.providerType || "INDIVIDUAL";
  const providerName =
    provider.identity.providerName ||
    provider.identity.responsiblePersonName ||
    "Verified Provider";

  const getProviderIcon = () => {
    switch (providerType) {
      case "NGO":
        return <Building className="h-5 w-5 text-purple-600" />;
      case "VOLUNTEER_GROUP":
        return <Users className="h-5 w-5 text-emerald-600" />;
      default:
        return <User className="h-5 w-5 text-blue-600" />;
    }
  };

  const getProviderBadgeColor = () => {
    switch (providerType) {
      case "NGO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "VOLUNTEER_GROUP":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const profileImageUrl =
    provider.documents.profileImage?.url ||
    provider.documents.logo?.url;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header Overview Banner */}
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={providerName}
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200 shrink-0">
              {getProviderIcon()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-base">{providerName}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${getProviderBadgeColor()}`}
              >
                {providerType.replace("_", " ")}
              </span>
              <StatusBadge status={provider.status.providerStatus} />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              {provider.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {provider.email}
                </span>
              )}
              {provider.identity.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {provider.identity.phone}
                </span>
              )}
              {provider.identity.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px]">{provider.identity.address}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <FileCheck className="h-3.5 w-3.5 text-slate-500" />
          <span>{isExpanded ? "Hide Full Profile" : "View Full Profile & Documents"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Expandable Full Profile Sections */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-white border-t border-slate-100">
          <ProviderIdentitySection
            title="Identity Details"
            variant="admin"
            data={{
              providerType: provider.identity.providerType,
              providerName: provider.identity.providerName,
              responsiblePersonName: provider.identity.responsiblePersonName,
              email: provider.email,
              phone: provider.identity.phone,
              address: provider.identity.address,
            }}
          />

          <ProviderDocumentsSection
            title="Verification Documents"
            variant="admin"
            providerType={provider.identity.providerType}
            documents={provider.documents}
          />

          <ProviderWorkPreferencesSection
            title="Work Preferences & Coverage"
            variant="admin"
            data={{
              categoriesWillingToWork: provider.workPreferences.categoriesWillingToWork,
              websiteLinks: provider.workPreferences.websiteLinks,
            }}
          />

          {(provider.volunteerGroupProfile || provider.organizationProfile) && (
            <ProviderOrganizationSection
              title="Organization Details"
              variant="admin"
              data={{
                providerType: provider.identity.providerType,
                volunteerGroupProfile: provider.volunteerGroupProfile,
                organizationProfile: provider.organizationProfile,
                documents: provider.documents,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProviderProfileCard;
