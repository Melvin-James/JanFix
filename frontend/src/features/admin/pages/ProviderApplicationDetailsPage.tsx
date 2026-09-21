import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { getProviderApplicationDetails, approveProviderApplication, rejectProviderApplication } from "../services/adminService";

import type { ProviderApplicationsDetails } from "../types/ProviderApplication";

function ProviderApplicationDetailsPage() {

    const navigate = useNavigate();

    const [isApproving, setIsApproving] = useState(false);

    const [isRejecting, setIsRejecting] = useState(false);

    const [showRejectModal, setShowRejectModal] = useState(false);

    const [rejectionReason, setRejectionReason] = useState("");

    const [rejectError, setRejectError] = useState("");

    const { userId } = useParams<{ userId: string }>();

    const [application, setApplication] = useState<ProviderApplicationsDetails | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const handleApprove = async () => {

        if (!application) return;

        try {

            setIsApproving(true);

            await approveProviderApplication(application.id);

            setApplication((current) => current ? { ...current, status: { ...current.status, applicationStatus: "APPROVED", reviewedAt: new Date().toISOString(), }, } : current);

        } catch (error) {

            console.error("Failed to approve provider application:", error);

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

            await rejectProviderApplication(
                application.id,
                reason
            );

            setApplication((current) => current ? { ...current, status: { ...current.status, applicationStatus: "REJECTED", reviewedAt: new Date().toISOString(), rejectionReason: reason, }, } : current);

            setShowRejectModal(false);

            setRejectionReason("");

        } catch (error) {

            console.error("Failed to reject provider application", error);

            setRejectError("Failed to reject the application. Please try again.");

        } finally {

            setIsRejecting(false);

        }
    }

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
                <p className="text-sm text-slate-500">
                    Loading application...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Application not found
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/provider-applications")
                        }
                        className="mb-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        ← Back to Applications
                    </button>

                    <h1 className="text-2xl font-semibold text-slate-900">
                        Provider Application
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review application details for {application.fullName}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${application.status.applicationStatus === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : application.status.applicationStatus === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                    >
                        {application.status.applicationStatus}
                    </span>

                    {application.status.applicationStatus !== "APPROVED" &&
                        application.status.applicationStatus !== "REJECTED" && (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={isApproving || isRejecting}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isApproving
                                        ? "Approving..."
                                        : "Approve Application"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setRejectError("");
                                        setShowRejectModal(true);
                                    }}
                                    disabled={isApproving || isRejecting}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Reject Application
                                </button>
                            </div>
                        )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Applicant */}
                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Applicant
                        </h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Full Name
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.fullName}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Email
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.email}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Identity */}
                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Identity
                        </h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Provider Type
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.identity.providerType ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Provider Name
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.identity.providerName ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Responsible Person
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.identity.responsiblePersonName ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Phone
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.identity.phone ?? "—"}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Address
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.identity.address ?? "—"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Application status */}
                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Application Status
                        </h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-3">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Status
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {application.status.applicationStatus}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Submitted
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {new Date(
                                    application.status.submittedAt
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Reviewed
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {application.status.reviewedAt
                                    ? new Date(
                                        application.status.reviewedAt
                                    ).toLocaleString("en-IN")
                                    : "Not reviewed"}
                            </p>
                        </div>

                        {application.status.rejectionReason && (
                            <div className="md:col-span-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Rejection Reason
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                    {application.status.rejectionReason}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                {/* Documents */}
                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Documents
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Documents and files submitted with the application.
                        </p>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        {/* Identity Proof - required for every provider */}
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                Identity Proof
                            </p>

                            {application.documents.identityProof ? (
                                <a
                                    href={application.documents.identityProof.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                                >
                                    View Identity Proof
                                </a>
                            ) : (
                                <p className="text-sm text-red-600">
                                    Not provided
                                </p>
                            )}
                        </div>

                        {/* Profile Image - required for every provider */}
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                Profile Image
                            </p>

                            {application.documents.profileImage ? (
                                <a
                                    href={application.documents.profileImage.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                                >
                                    View Profile Image
                                </a>
                            ) : (
                                <p className="text-sm text-red-600">
                                    Not provided
                                </p>
                            )}
                        </div>

                        {/* Community Photos - available for every provider */}
                        <div className="md:col-span-2">
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                Previous Community Photos
                            </p>

                            {application.documents.previousCommunityPhotos &&
                                application.documents.previousCommunityPhotos.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {application.documents.previousCommunityPhotos.map(
                                        (photo, index) => (
                                            <a
                                                key={photo.publicId ?? photo.url ?? index}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group overflow-hidden rounded-lg border border-slate-200"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={`Community photo ${index + 1}`}
                                                    className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </a>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No community photos provided.
                                </p>
                            )}
                        </div>

                        {/* NGO Registration - NGO only */}
                        {application.identity.providerType === "NGO" && (
                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    NGO Registration Document
                                </p>

                                {application.documents.ngoRegistrationDocument ? (
                                    <a
                                        href={
                                            application.documents.ngoRegistrationDocument.url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                                    >
                                        View Registration Document
                                    </a>
                                ) : (
                                    <p className="text-sm text-red-600">
                                        Not provided
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Logo - Volunteer Group and NGO */}
                        {(application.identity.providerType === "VOLUNTEER_GROUP" ||
                            application.identity.providerType === "NGO") && (
                                <div>
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Logo
                                    </p>

                                    {application.documents.logo ? (
                                        <a
                                            href={application.documents.logo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                                        >
                                            View Logo
                                        </a>
                                    ) : (
                                        <p className="text-sm text-red-600">
                                            Not provided
                                        </p>
                                    )}
                                </div>
                            )}
                    </div>
                </section>
            </div>
            {
                showRejectModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4">
                        <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Reject Provider Application
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Provide a reason for rejecting this application.
                                </p>
                            </div>

                            <div className="px-6 py-5">
                                <label
                                    htmlFor="rejectionReason"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Rejection Reason
                                </label>

                                <textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(event) => {
                                        setRejectionReason(event.target.value);
                                        setRejectError("");
                                    }}
                                    rows={5}
                                    placeholder="Explain why this application is being rejected..."
                                    className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />

                                <div className="mt-2 min-h-5">
                                    {rejectError && (
                                        <p className="text-sm text-red-600">
                                            {rejectError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason("");
                                        setRejectError("");
                                    }}
                                    disabled={isRejecting}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isRejecting
                                        ? "Rejecting..."
                                        : "Confirm Rejection"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default ProviderApplicationDetailsPage;