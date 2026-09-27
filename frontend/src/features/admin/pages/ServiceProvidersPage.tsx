import { useEffect, useMemo, useState } from "react";

import { Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getServiceProviders, updateServiceProviderStatus } from "../services/adminService";

import type { ServiceProvider, ProviderStatus } from "../types/ServiceProvider";

import { ProviderType } from "../../provider/types/providerTypes";

import {
    AdminActionButton,
    AdminCard,
    AdminEmptyState,
    AdminErrorState,
    AdminFilterBar,
    AdminFilterSelect,
    AdminLoadingState,
    AdminPageHeader,
    AdminPagination,
    AdminSearchBar,
    AdminTable,
    BlockUnblockButton,
    StatusBadge,
} from "../components";
import { usePagination } from "../hooks";

function ServiceProvidersPage() {
    const navigate = useNavigate();

    const [providers, setProviders] = useState<ServiceProvider[]>([]);

    const [updatingProviderId, setUpdatingProviderId] = useState<string | null>(
        null
    );

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [providerTypeFilter, setProviderTypeFilter] =
        useState<ProviderType | "ALL">("ALL");

    const [statusFilter, setStatusFilter] =
        useState<ProviderStatus | "ALL">("ALL");

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getServiceProviders();

                setProviders(data);
            } catch {
                setError("Failed to load service providers.");
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, []);

    const handleStatusChange = async (
        providerId: string,
        currentStatus: ServiceProvider["providerStatus"]
    ) => {
        const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";

        if(currentStatus === "ACTIVE" && !window.confirm("Are you sure you want to block this service provider?")) {
            return;
        }

        try {
            setUpdatingProviderId(providerId);

            const updatedProvider = await updateServiceProviderStatus(
                providerId,
                nextStatus
            );

            setProviders((currentProviders) => currentProviders.map((provider) => provider.id === providerId ? { ...provider, providerStatus: updatedProvider.providerStatus } : provider));
        } catch {
            setError("Failed to update service provider status");
        } finally {
            setUpdatingProviderId(null);
        }
    };

    const filteredProviders = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return providers.filter((provider) => {
            const matchesSearch =
                normalizedSearch === "" ||
                provider.responsiblePersonName
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                provider.email
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                provider.providerName
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const matchesProviderType =
                providerTypeFilter === "ALL" ||
                provider.providerType === providerTypeFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                provider.providerStatus === statusFilter;

            return (
                matchesSearch &&
                matchesProviderType &&
                matchesStatus
            );
        });
    }, [
        providers,
        search,
        providerTypeFilter,
        statusFilter,
    ]);

    const itemsPerPage = 5;

    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedProviders,
        setCurrentPage,
    } = usePagination({
        items: filteredProviders,
        itemsPerPage,
        resetDependencies: [search, providerTypeFilter, statusFilter],
    });

    if (loading) {
        return <AdminLoadingState message="Loading service providers..." />;
    }

    if (error) {
        return <AdminErrorState message={error} />;
    }

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Service Providers"
                description="Manage approved service providers."
            />

            <AdminCard>
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="mb-4">
                        <h2 className="font-medium text-slate-900">
                            Providers
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Showing {paginatedProviders.length} of{" "}
                            {providers.length} providers
                        </p>
                    </div>

                    <AdminFilterBar>
                        <div className="flex-1">
                            <AdminSearchBar
                                value={search}
                                onChange={setSearch}
                                placeholder="Search by name, email or provider name..."
                            />
                        </div>

                        <AdminFilterSelect
                            value={providerTypeFilter}
                            onChange={(value) =>
                                setProviderTypeFilter(
                                    value as ProviderType | "ALL"
                                )
                            }
                            options={[
                                { value: "ALL", label: "All Provider Types" },
                                { value: "INDIVIDUAL", label: "Individual" },
                                { value: "VOLUNTEER_GROUP", label: "Volunteer Group" },
                                { value: "NGO", label: "NGO" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={statusFilter}
                            onChange={(value) =>
                                setStatusFilter(
                                    value as ProviderStatus | "ALL"
                                )
                            }
                            options={[
                                { value: "ALL", label: "All Statuses" },
                                { value: "ACTIVE", label: "Active" },
                                { value: "BLOCKED", label: "Blocked" },
                            ]}
                        />
                    </AdminFilterBar>
                </div>

                <AdminTable
                    columns={[
                        "Responsible Person",
                        "Provider Type",
                        "Provider Name",
                        "Status",
                        "Actions",
                    ]}
                >
                    {paginatedProviders.map((provider) => (
                        <tr key={provider.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {provider.responsiblePersonName ?? "—"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {provider.email}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                    {provider.providerType ?? "—"}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                    {provider.providerName ?? "—"}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                <StatusBadge status={provider.providerStatus} />
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <BlockUnblockButton
                                        status={provider.providerStatus}
                                        onClick={() =>
                                            handleStatusChange(
                                                provider.id,
                                                provider.providerStatus
                                            )
                                        }
                                        disabled={updatingProviderId === provider.id}
                                        isUpdating={updatingProviderId === provider.id}
                                        title={
                                            provider.providerStatus === "ACTIVE"
                                                ? "Block provider"
                                                : "Unblock provider"
                                        }
                                        variant="bordered"
                                    />

                                    <AdminActionButton
                                        onClick={() =>
                                            navigate(`/admin/service-providers/${provider.id}`)
                                        }
                                        title="View details"
                                        icon={<Eye className="size-4" />}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {filteredProviders.length === 0 && (
                    <AdminEmptyState
                        message={
                            providers.length === 0
                                ? "No service providers found"
                                : "No providers match your search or filters"
                        }
                    />
                )}

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>
        </div>
    );
}

export default ServiceProvidersPage;