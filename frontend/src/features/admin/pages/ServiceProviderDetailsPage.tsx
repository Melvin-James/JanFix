import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getServiceProviderDetails } from "../services/adminService";
import type { ServiceProviderDetails } from "../types/ServiceProviderDetails";

import DetailPageHeader from "../components/DetailPageHeader";
import { StatusBadge } from "../components/StatusBadge";

import ProviderIdentitySection from "../../provider/components/ProviderIdentitySection";
import ProviderDocumentsSection from "../../provider/components/ProviderDocumentsSection";
import ProviderWorkPreferencesSection from "../../provider/components/ProviderWorkPreferencesSection";
import ProviderOrganizationSection from "../../provider/components/ProviderOrganizationSection";
import ProviderStatusSection from "../../provider/components/ProviderStatusSection";

function ServiceProviderDetailsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [provider, setProvider] = useState<ServiceProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      if (!userId) {
        setError("Invalid service provider.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getServiceProviderDetails(userId);
        setProvider(data);
      } catch {
        setError("Failed to load service provider.");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Loading service provider...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Service provider not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DetailPageHeader
        title="Service Provider"
        description="Manage service provider details and status."
        backText="← Back to Service Providers"
        onBack={() => navigate("/admin/service-providers")}
        actions={<StatusBadge status={provider.status.providerStatus} />}
      />

      <div className="space-y-6">
        {/* Identity Section */}
        <ProviderIdentitySection
          title="Identity"
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

        {/* Documents Section */}
        <ProviderDocumentsSection
          title="Documents"
          variant="admin"
          providerType={provider.identity.providerType}
          documents={provider.documents}
        />

        {/* Work Preferences Section */}
        <ProviderWorkPreferencesSection
          title="Work Preferences"
          variant="admin"
          data={{
            categoriesWillingToWork: provider.workPreferences.categoriesWillingToWork,
            websiteLinks: provider.workPreferences.websiteLinks,
          }}
        />

        {/* Organization Section */}
        <ProviderOrganizationSection
          title="Organization Profile"
          variant="admin"
          data={{
            providerType: provider.identity.providerType,
            volunteerGroupProfile: provider.volunteerGroupProfile,
            organizationProfile: provider.organizationProfile,
            documents: provider.documents,
          }}
        />

        {/* Application & Provider Status Section */}
        <ProviderStatusSection
          title="Application & Provider Status"
          variant="admin"
          status={{
            applicationStatus: provider.status.applicationStatus,
            providerStatus: provider.status.providerStatus,
            submittedAt: provider.status.submittedAt,
            reviewedAt: provider.status.reviewedAt,
            rejectionReason: provider.status.rejectionReason,
          }}
        />
      </div>
    </div>
  );
}

export default ServiceProviderDetailsPage;