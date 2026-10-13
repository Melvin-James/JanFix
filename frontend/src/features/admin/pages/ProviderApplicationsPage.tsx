import { useEffect, useRef, useState } from "react";

import { Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getProviderApplications } from "../services/adminService";

import type { ProviderApplication } from "../types/ProviderApplication";

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
    StatusBadge,
} from "../components";

function ProviderApplicationsPage() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState<ProviderApplication[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [providerTypeFilter, setProviderTypeFilter] = useState("ALL");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [totalItems, setTotalItems] = useState(0);

    const [backgroundLoading, setBackgroundLoading] = useState(false);

    const hasLoadedOnce = useRef(false);

    const itemsPerPage = 10;

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timeOutId);
    }, [search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [providerTypeFilter, statusFilter]);

    useEffect(() => {

        let cancelled = false;

        const fetchApplications = async () => {

            if (!hasLoadedOnce.current) {
                setLoading(true);
            } else {
                setBackgroundLoading(true);
            }

            setError("");

            try {
                const response = await getProviderApplications({
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

                setApplications(response.items);

                setTotalPages(response.pagination.totalPages);

                setTotalItems(response.pagination.totalItems);
            } catch {
                if (!cancelled) {
                    setError("Failed to load provider applications.");
                }
            } finally {
                if (!cancelled) {
                    hasLoadedOnce.current = true;
                    setLoading(false);
                    setBackgroundLoading(false);
                }
            }
        };

        fetchApplications();

        return () => {
            cancelled = true;
        };
    }, [currentPage, debouncedSearch, providerTypeFilter, statusFilter]);


    if (loading) {
        return <AdminLoadingState message="Loading provider applications..." />;
    }

    if (error && !hasLoadedOnce.current) {
        return <AdminErrorState message={error} />;
    }

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Provider Applications"
                description="Review and manage service provider applications."
            />

            <AdminCard>
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="mb-4">
                        <h2 className="font-medium text-slate-900">
                            Applications
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            showing {applications.length} of {totalItems} applications
                            {backgroundLoading && (
                                <span className="text-xs text-slate-500">
                                    Updating results...
                                </span>
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
                            onChange={setProviderTypeFilter}
                            options={[
                                { value: "ALL", label: "All Provider Types" },
                                { value: "INDIVIDUAL", label: "Individual" },
                                { value: "VOLUNTEER_GROUP", label: "Volunteer Group" },
                                { value: "NGO", label: "NGO" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "ALL", label: "All Statuses" },
                                { value: "UNDER_REVIEW", label: "Under Review" },
                                { value: "APPROVED", label: "Approved" },
                                { value: "REJECTED", label: "Rejected" },
                            ]}
                        />
                    </AdminFilterBar>
                </div>

                <AdminTable
                    columns={[
                        "Applicant",
                        "Provider Type",
                        "Provider Name",
                        "Status",
                        "Submitted",
                        { header: "Action", align: "right" },
                    ]}
                >
                    {applications.map((application) => (
                        <tr
                            key={application.id}
                            className="hover:bg-slate-50"
                        >
                            {/* Applicant */}
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {application.fullName}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {application.email}
                                    </p>
                                </div>
                            </td>

                            {/* Provider type */}
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                    {application.providerType ?? "—"}
                                </span>
                            </td>

                            {/* Provider name */}
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                    {application.providerName ?? "—"}
                                </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                <StatusBadge
                                    status={application.applicationStatus}
                                />
                            </td>

                            {/* Submitted date */}
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-600">
                                    {new Date(
                                        application.submittedAt
                                    ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 text-right">
                                <AdminActionButton
                                    onClick={() =>
                                        navigate(`/admin/provider-applications/${application.id}`)
                                    }
                                    icon={<Eye className="size-4" />}
                                    label="View Details"
                                />
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {applications.length === 0 && !backgroundLoading && (
                    <AdminEmptyState
                        message={
                            debouncedSearch ||
                            providerTypeFilter !== "ALL" ||
                            statusFilter !== "ALL"
                                ? "No applications match your search or filters"
                                : "No provider applications found"
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

export default ProviderApplicationsPage;