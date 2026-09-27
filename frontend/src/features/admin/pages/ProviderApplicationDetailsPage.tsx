import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getProviderApplicationDetails,
  approveProviderApplication,
  rejectProviderApplication,
} from "../services/adminService";
import type { ProviderApplicationsDetails } from "../types/ProviderApplication";

import DetailPageHeader from "../components/DetailPageHeader";
import ProviderApplicationActions from "../components/ProviderApplicationActions";
import RejectApplicationModal from "../components/RejectApplicationModal";

import DetailSection from "../../provider/components/DetailSection";
import DetailGrid from "../../provider/components/DetailGrid";
import DetailField from "../../provider/components/DetailField";
import ProviderIdentitySection from "../../provider/components/ProviderIdentitySection";
import ProviderDocumentsSection from "../../provider/components/ProviderDocumentsSection";
import ProviderStatusSection from "../../provider/components/ProviderStatusSection";

function ProviderApplicationDetailsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [application, setApplication] = useState<ProviderApplicationsDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const handleApprove = async () => {
    if (!application) return;

    try {
      setIsApproving(true);
      await approveProviderApplication(application.id);
      setApplication((current) =>
        current
          ? {
              ...current,
              status: {
                ...current.status,
                applicationStatus: "APPROVED",
                reviewedAt: new Date().toISOString(),
              },
            }
          : current
      );
    } catch (err) {
      console.error("Failed to approve provider application:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectError("Rejection reason is required");
      return;
    }

    try {
      setIsRejecting(true);
      setRejectError("");

      await rejectProviderApplication(application.id, reason);

      setApplication((current) =>
        current
          ? {
              ...current,
              status: {
                ...current.status,
                applicationStatus: "REJECTED",
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason,
              },
            }
          : current
      );

      setShowRejectModal(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject provider application", err);
      setRejectError("Failed to reject the application. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  useEffect(() => {
    const fetchApplication = async () => {
      if (!userId) {
        setError("Invalid application.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getProviderApplicationDetails(userId);
        setApplication(data);
      } catch {
        setError("Failed to load provider application.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Loading application...</p>
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

  if (!application) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Application not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DetailPageHeader
        title="Provider Application"
        description={`Review application details for ${application.fullName}.`}
        backText="← Back to Applications"
        onBack={() => navigate("/admin/provider-applications")}
        actions={
          <ProviderApplicationActions
            status={application.status.applicationStatus}
            isApproving={isApproving}
            isRejecting={isRejecting}
            onApprove={handleApprove}
            onReject={() => {
              setRejectError("");
              setShowRejectModal(true);
            }}
          />
        }
      />

      <div className="space-y-6">
        {/* Applicant Section */}
        <DetailSection title="Applicant" variant="admin">
          <DetailGrid columns={2}>
            <DetailField label="Full Name" value={application.fullName} />
            <DetailField label="Email" value={application.email} />
          </DetailGrid>
        </DetailSection>

        {/* Identity Section */}
        <ProviderIdentitySection
          title="Identity"
          variant="admin"
          data={{
            providerType: application.identity.providerType,
            providerName: application.identity.providerName,
            responsiblePersonName: application.identity.responsiblePersonName,
            phone: application.identity.phone,
            address: application.identity.address,
          }}
        />

        {/* Application Status Section */}
        <ProviderStatusSection
          title="Application Status"
          variant="admin"
          status={{
            applicationStatus: application.status.applicationStatus,
            submittedAt: application.status.submittedAt,
            reviewedAt: application.status.reviewedAt,
            rejectionReason: application.status.rejectionReason,
          }}
        />

        {/* Documents Section */}
        <ProviderDocumentsSection
          title="Documents"
          subtitle="Documents and files submitted with the application."
          variant="admin"
          fileVariant="button"
          providerType={application.identity.providerType}
          documents={application.documents}
        />
      </div>

      <RejectApplicationModal
        isOpen={showRejectModal}
        rejectionReason={rejectionReason}
        rejectError={rejectError}
        isRejecting={isRejecting}
        onReasonChange={(val) => {
          setRejectionReason(val);
          setRejectError("");
        }}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setRejectError("");
        }}
        onConfirm={handleReject}
      />
    </div>
  );
}

export default ProviderApplicationDetailsPage;