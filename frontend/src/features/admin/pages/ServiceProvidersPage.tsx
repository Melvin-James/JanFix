import { useEffect, useMemo, useState } from "react";

import { Eye, Ban, Check } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getServiceProviders, updateServiceProviderStatus } from "../services/adminService";

import type { ServiceProvider, ProviderStatus, } from "../types/ServiceProvider";

import { ProviderType } from "../../provider/types/providerTypes";

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

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

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

    }

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

    useEffect(() => {
        setCurrentPage(1);
    }, [search, providerTypeFilter, statusFilter]);

    const totalPages = Math.ceil(
        filteredProviders.length / itemsPerPage
    );

    const paginatedProviders = filteredProviders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Loading service providers...
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

    return (
        <div className="p-6">

            {/* Page heading */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Service Providers
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage approved service providers.
                </p>
            </div>

            {/* Table container */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                {/* Table header */}
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

                    {/* Search + filters */}
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                        <div className="flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name, email or provider name..."
                                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={providerTypeFilter}
                            onChange={(event) =>
                                setProviderTypeFilter(
                                    event.target.value as
                                    | ProviderType
                                    | "ALL"
                                )
                            }
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">
                                All Provider Types
                            </option>

                            <option value="INDIVIDUAL">
                                Individual
                            </option>

                            <option value="VOLUNTEER_GROUP">
                                Volunteer Group
                            </option>

                            <option value="NGO">
                                NGO
                            </option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as
                                    | ProviderStatus
                                    | "ALL"
                                )
                            }
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">
                                All Statuses
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="BLOCKED">
                                Blocked
                            </option>
                        </select>

                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">

                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Responsible Person
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Provider Type
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Provider Name
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">

                            {paginatedProviders.map((provider) => (

                                <tr
                                    key={provider.id}
                                    className="hover:bg-slate-50"
                                >

                                    {/* Responsible person */}
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

                                    {/* Provider type */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-700">
                                            {provider.providerType ?? "—"}
                                        </span>
                                    </td>

                                    {/* Provider name */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-700">
                                            {provider.providerName ?? "—"}
                                        </span>
                                    </td>

                                    {/* Operational status */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${provider.providerStatus === "ACTIVE"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {provider.providerStatus}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Block / Unblock */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(
                                                        provider.id,
                                                        provider.providerStatus
                                                    )
                                                }
                                                disabled={updatingProviderId === provider.id}
                                                title={
                                                    provider.providerStatus === "ACTIVE"
                                                        ? "Block provider"
                                                        : "Unblock provider"
                                                }
                                                className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${provider.providerStatus === "ACTIVE"
                                                        ? "border-red-200 text-red-600 hover:bg-red-50"
                                                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                            >
                                                {updatingProviderId === provider.id ? (
                                                    <span className="text-xs">...</span>
                                                ) : provider.providerStatus === "ACTIVE" ? (
                                                    <Ban className="size-4" />
                                                ) : (
                                                    <Check className="size-4" />
                                                )}
                                            </button>

                                            {/* View Details */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(`/admin/service-providers/${provider.id}`)
                                                }
                                                title="View details"
                                                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100"
                                            >
                                                <Eye className="size-4" />
                                            </button>
                                        </div>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                </div>

                {/* Empty state */}
                {filteredProviders.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-500">
                            {providers.length === 0
                                ? "No service providers found"
                                : "No providers match your search or filters"}
                        </p>
                    </div>
                )}

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">

                    <p className="text-sm text-slate-500">
                        Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page - 1
                                )
                            }
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page + 1
                                )
                            }
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default ServiceProvidersPage;