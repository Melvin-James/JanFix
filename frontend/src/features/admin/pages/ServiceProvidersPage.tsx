import { useEffect, useState, useRef } from "react";

import { Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getServiceProviders, updateServiceProviderStatus } from "../services/adminService";

import type { ServiceProvider, ProviderStatus } from "../types/ServiceProvider";

import { ProviderType } from "../../provider/types/providerTypes";

import { ConfirmationModal } from "../components";

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

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [totalItems, setTotalItems] = useState(0);

    const [backgroundLoading, setBackgroundLoading] = useState(false);

    const hasLoadedOnce = useRef(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [providerTypeFilter, statusFilter]);

    useEffect(() => {
        let cancelled = false;

        const fetchProviders = async () => {
            if (!hasLoadedOnce.current) {
                setLoading(true);
            } else {
                setBackgroundLoading(true);
            }

            setError("");

            try {
                
                const response = await getServiceProviders({
                    page: currentPage,
                    pageSize: itemsPerPage,
                    search: debouncedSearch || undefined,
                    providerType:
                        providerTypeFilter === "ALL"
                            ? undefined
                            : providerTypeFilter,
                    status:
                        statusFilter === "ALL"
                            ? undefined
                            : statusFilter,
                });

                if (cancelled) return;

                setProviders(response.items);
                setTotalPages(response.pagination.totalPages);
                setTotalItems(response.pagination.totalItems);
            } catch {
                if (!cancelled) {
                    setError("Failed to load service providers.");
                }
            } finally {
                if (!cancelled) {
                    hasLoadedOnce.current = true;
                    setLoading(false);
                    setBackgroundLoading(false);
                }
            }
        };

        fetchProviders();

        return () => {
            cancelled = true;
        };
    }, [currentPage, debouncedSearch, providerTypeFilter, statusFilter]);


    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        providerId: string;
        nextStatus: ServiceProvider["providerStatus"];
    }>({
        isOpen: false,
        providerId: "",
        nextStatus: "ACTIVE"
    });

    const handleStatusChange = async (
        providerId: string,
        currentStatus: ServiceProvider["providerStatus"]
    ) => {
        const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";

        if (currentStatus === "ACTIVE") {
            setConfirmModal({
                isOpen: true,
                providerId,
                nextStatus,
            });
            return;
        }

        executeStatusUpdate(providerId, nextStatus);
    }

    const executeStatusUpdate = async (
        providerId: string,
        nextStatus: ServiceProvider["providerStatus"]
    ) => {
        try {
            setUpdatingProviderId(providerId);

            const updatedProvider = await updateServiceProviderStatus(
                providerId,
                nextStatus
            );

            setProviders((currentProviders) =>
                currentProviders.map((provider) =>
                    provider.id === providerId
                        ? { ...provider, providerStatus: updatedProvider.providerStatus }
                        : provider
                )
            );
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch {
            setError("Failed to update service provider status");
        } finally {
            setUpdatingProviderId(null);
        }
    }


    const itemsPerPage = 10;


    if (loading) {
        return <AdminLoadingState message="Loading service providers..." />;
    }

    if (error && !hasLoadedOnce.current) {
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
                            Showing {providers.length} of {totalItems} providers
                            {backgroundLoading && (
                                <span className="ml-2 text-xs text-slate-500">Updating results...</span>
                            )}
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
                    {providers.map((provider) => (
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

                {providers.length === 0 && !backgroundLoading && (
                    <AdminEmptyState
                        message={
                            debouncedSearch ||
                                providerTypeFilter !== "ALL" ||
                                statusFilter !== "ALL"
                                ? "No providers match your search or filters"
                                : "No service providers found"
                        }
                    />
                )}

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title="Block Service Provider"
                message="Are you sure you want to block this service provider? They will no longer receive user requests or be visible in listings."
                confirmLabel="Block Provider"
                loadingLabel="Blocking..."
                variant="danger"
                isLoading={updatingProviderId === confirmModal.providerId}
                onConfirm={() => executeStatusUpdate(confirmModal.providerId, confirmModal.nextStatus)}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default ServiceProvidersPage;
