import { useEffect, useState, useMemo } from "react";

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
import { usePagination } from "../hooks";

function ProviderApplicationsPage() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState<ProviderApplication[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");



    const [providerTypeFilter, setProviderTypeFilter] = useState("ALL");

    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProviderApplications();

                setApplications(data);
            } catch {
                setError("Failed to load provider applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return applications.filter((application) => {
            const matchesSearch =
                normalizedSearch === "" ||
                application.fullName.toLowerCase().includes(normalizedSearch) ||
                application.email.toLowerCase().includes(normalizedSearch) ||
                application.providerName?.toLowerCase().includes(normalizedSearch);

            const matchesProviderType =
                providerTypeFilter === 'ALL' ||
                application.providerType === providerTypeFilter;

            const matchesStatus =
                statusFilter === 'ALL' ||
                application.applicationStatus === statusFilter;

            return (
                matchesSearch &&
                matchesProviderType &&
                matchesStatus
            );
        });
    }, [
        applications,
        search,
        providerTypeFilter,
        statusFilter,
    ]);

    const itemsPerPage = 5;

    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedApplications,
        setCurrentPage,
    } = usePagination({
        items: filteredApplications,
        itemsPerPage,
        resetDependencies: [search, providerTypeFilter, statusFilter],
    });

    if (loading) {
        return <AdminLoadingState message="Loading provider applications..." />;
    }

    if (error) {
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
                            showing {paginatedApplications.length} of {applications.length} applications
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
                                { value: "SUBMITTED", label: "Submitted" },
                                { value: "UNDER_REVIEW", label: "Under Review" },
                                { value: "APPORVED", label: "Approved" },
                                { value: "Rejected", label: "Rejected" },
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
                    {paginatedApplications.map((application) => (
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

                {filteredApplications.length === 0 && (
                    <AdminEmptyState
                        message={
                            applications.length === 0
                                ? "No provider applications found"
                                : "No applications match your search or filters"
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