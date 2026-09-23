import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getServiceProviderDetails } from "../services/adminService";

import type { ServiceProviderDetails } from "../types/ServiceProviderDetails";

function ServiceProviderDetailsPage() {
    const navigate = useNavigate();

    const { userId } = useParams<{ userId: string }>();

    const [provider, setProvider] =
        useState<ServiceProviderDetails | null>(null);

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
                <p className="text-sm text-slate-500">
                    Loading service provider...
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

    if (!provider) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Service provider not found.
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
                            navigate("/admin/service-providers")
                        }
                        className="mb-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        ← Back to Service Providers
                    </button>

                    <h1 className="text-2xl font-semibold text-slate-900">
                        Service Provider
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage service provider details and status.
                    </p>
                </div>

                {/* Status + actions will be added later */}
                <div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${provider.status.providerStatus === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {provider.status.providerStatus}
                    </span>
                </div>

            </div>

            <div className="space-y-6">

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
                                {provider.identity.providerType ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Provider Name
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.identity.providerName ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Responsible Person
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.identity.responsiblePersonName ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Email
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Phone
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.identity.phone ?? "—"}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Address
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.identity.address ?? "—"}
                            </p>
                        </div>

                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">Documents</h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        {/* Identity Proof - mandatory for every provider */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Identity Proof
                            </p>

                            {provider.documents.identityProof ? (
                                <a
                                    href={provider.documents.identityProof.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                                >
                                    {provider.documents.identityProof.originalName}
                                </a>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">Not provided</p>
                            )}
                        </div>

                        {/* Profile Image - optional for every provider */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Profile Image
                            </p>

                            {provider.documents.profileImage ? (
                                <a
                                    href={provider.documents.profileImage.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                                >
                                    {provider.documents.profileImage.originalName}
                                </a>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">Not provided</p>
                            )}
                        </div>

                        {/* Community Photos - optional for every provider */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Previous Community Photos
                            </p>

                            {provider.documents.previousCommunityPhotos &&
                                provider.documents.previousCommunityPhotos.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                    {provider.documents.previousCommunityPhotos.map((photo) => (
                                        <a
                                            key={photo.key}
                                            href={photo.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block text-sm text-blue-600 hover:underline"
                                        >
                                            {photo.originalName}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">Not provided</p>
                            )}
                        </div>

                        {/* NGO Registration - only for NGOs */}
                        {provider.identity.providerType === "NGO" && (
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    NGO Registration Document
                                </p>

                                {provider.documents.ngoRegistrationDocument ? (
                                    <a
                                        href={provider.documents.ngoRegistrationDocument.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                                    >
                                        {provider.documents.ngoRegistrationDocument.originalName}
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm text-slate-500">Not provided</p>
                                )}
                            </div>
                        )}

                        {/* Logo - only for NGOs and Volunteer Groups */}
                        {(provider.identity.providerType === "NGO" ||
                            provider.identity.providerType === "VOLUNTEER_GROUP") && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Logo
                                    </p>

                                    {provider.documents.logo ? (
                                        <a
                                            href={provider.documents.logo.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                                        >
                                            {provider.documents.logo.originalName}
                                        </a>
                                    ) : (
                                        <p className="mt-1 text-sm text-slate-500">Not provided</p>
                                    )}
                                </div>
                            )}
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">Work Preferences</h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Categories Willing to Work
                            </p>

                            {provider.workPreferences.categoriesWillingToWork &&
                                provider.workPreferences.categoriesWillingToWork.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {provider.workPreferences.categoriesWillingToWork.map(
                                        (category) => (
                                            <span
                                                key={category}
                                                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                            >
                                                {category}
                                            </span>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">Not provided</p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Website Links
                            </p>

                            {provider.workPreferences.websiteLinks &&
                                provider.workPreferences.websiteLinks.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                    {provider.workPreferences.websiteLinks.map((link) => (
                                        <a
                                            key={link}
                                            href={link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block break-all text-sm text-blue-600 hover:underline"
                                        >
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">Not provided</p>
                            )}
                        </div>
                    </div>
                </section>

                {(provider.volunteerGroupProfile || provider.organizationProfile) && (
                    <section className="rounded-lg border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="font-semibold text-slate-900">Organization Profile</h2>
                        </div>

                        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                            {provider.volunteerGroupProfile && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Volunteer Group Members
                                    </p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {provider.volunteerGroupProfile.memberCount}
                                    </p>
                                </div>
                            )}

                            {provider.organizationProfile && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Organization Members
                                    </p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {provider.organizationProfile.memberCount}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Application & Provider Status
                        </h2>
                    </div>

                    <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Application Status
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {provider.status.applicationStatus}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Provider Status
                            </p>

                            <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${provider.status.providerStatus === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {provider.status.providerStatus}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Submitted At
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {new Date(provider.status.submittedAt).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Reviewed At
                            </p>

                            <p className="mt-1 text-sm text-slate-900">
                                {provider.status.reviewedAt
                                    ? new Date(provider.status.reviewedAt).toLocaleString()
                                    : "Not reviewed"}
                            </p>
                        </div>

                        {provider.status.rejectionReason && (
                            <div className="md:col-span-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Rejection Reason
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {provider.status.rejectionReason}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </div>

        </div>
    );
}

export default ServiceProviderDetailsPage;