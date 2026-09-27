import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";
import { submitProviderApplication, resubmitProviderApplication } from "../services/providerService";
import { useProviderOnboardingStore } from "../store/providerOnboardingStore";
import { useAuthStore } from "../../../store/authStore";
import { ApplicationStatus } from "../constants/applicationStatus";

import ProviderIdentitySection from "../components/ProviderIdentitySection";
import ProviderDocumentsSection from "../components/ProviderDocumentsSection";
import ProviderOrganizationSection from "../components/ProviderOrganizationSection";
import ProviderWorkPreferencesSection from "../components/ProviderWorkPreferencesSection";

function ProviderReviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const draft = useProviderOnboardingStore((state) => state.draft);
  const clearDraft = useProviderOnboardingStore((state) => state.clearDraft);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  // Determine whether this is a resubmission based on the current user's
  // application status. Rejected providers enter via ProviderSubmissionPage
  // → hydrateDraft → step 2 → review, so we detect at review time.
  const isResubmission =
    user?.providerProfile?.status?.applicationStatus ===
    ApplicationStatus.REJECTED;

  const handleSubmitApplication = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const apiCall = isResubmission
        ? resubmitProviderApplication
        : submitProviderApplication;

      const response = await apiCall(draft);

      setAuth(accessToken!, response.data.user);
      clearDraft();

      navigate("/provider/application-submitted");
    } catch (error) {
      console.error(error);
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderOnboardingLayout currentStep={3}>
      <div className="mt-8 space-y-6">
        <ProviderIdentitySection
          title="Provider Information"
          variant="card"
          data={{
            providerType: draft.providerType,
            providerName: draft.providerName,
            responsiblePersonName: draft.responsiblePersonName,
            address: draft.address,
            phone: draft.phone,
          }}
        />

        <ProviderDocumentsSection
          title="Documents & Photos"
          variant="card"
          providerType={draft.providerType}
          documents={{
            identityProof: draft.identityProof,
            profileImage: draft.profileImage,
            previousCommunityPhotos: draft.previousCommunityPhotos,
          }}
        />

        <ProviderOrganizationSection
          variant="card"
          data={{
            providerType: draft.providerType,
            volunteerGroupProfile: draft.volunteerGroupProfile,
            organizationProfile: draft.organizationProfile,
          }}
        />

        <ProviderWorkPreferencesSection
          title="Work Preferences"
          variant="card"
          data={{
            categoriesWillingToWork: draft.categoriesWillingToWork,
            websiteLinks: draft.websiteLinks,
          }}
        />

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <div className="mt-10 flex gap-4">
          <button
            type="button"
            onClick={handleSubmitApplication}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading
              ? isResubmission
                ? "Resubmitting..."
                : "Submitting..."
              : isResubmission
              ? "Resubmit Application"
              : "Submit Application"}
          </button>
        </div>
      </div>
    </ProviderOnboardingLayout>
  );
}

export default ProviderReviewPage;