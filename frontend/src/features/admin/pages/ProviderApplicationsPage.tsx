import { useEffect, useState, useMemo } from "react";

import { Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getProviderApplications } from "../services/adminService";

import type { ProviderApplication } from "../types/ProviderApplication";

function ProviderApplicationsPage() {
    
    const navigate = useNavigate();

    const [applications, setApplications] = useState<ProviderApplication[]>([]);
    
    const [loading, setLoading] = useState(true);
    
    const [error, setError] = useState("");
    
    const [search, setSearch] = useState("");
    
    const [providerTypeFilter, setProviderTypeFilter] = useState("ALL");
    
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    const [currentPage, setCurrentPage] = useState(1);
    
    const itemsPerPage = 5;

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

    ])

    useEffect(() => {

        setCurrentPage(1);

    }, [search, providerTypeFilter, statusFilter]);

    const totalPages = Math.ceil(

        filteredApplications.length / itemsPerPage

    );

    const paginatedApplications = filteredApplications.slice(

        (currentPage - 1) * itemsPerPage,

        currentPage * itemsPerPage

    )

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-sm text-slate-500">

                    Loading provider applications...

                </p>

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

    return (
        <div className="p-6">
            {/* Page heading */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Provider Applications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Review and manage service provider applications.
                </p>
            </div>

            {/* Table container */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {/* Table header */}
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="mb-4">
                        <h2 className="font-medium text-slate-900"> 
                            Applications
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            showing {paginatedApplications.length} of {applications.length} applications
                        </p>

                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, email or provider name..."
                                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 

                            ></input>
                        </div>

                        <select
                            value={providerTypeFilter}
                            onChange={(event) => 
                                setProviderTypeFilter(event.target.value)
                            }
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus: border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">All Provider Types</option>
                            <option value="INDIVIDUAL">Individual</option>
                            <option value="VOLUNTEER_GROUP">Volunteer Group</option>
                            <option value="NGO">NGO</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) => 
                                setStatusFilter(event.target.value)
                            }
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL"> All Statuses</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPORVED">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Applicant
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

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Submitted
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
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
                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                            {application.applicationStatus}
                                        </span>
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
                                        <button
                                            type="button"
                                            onClick={()=>
                                                navigate(`/admin/provider-applications/${application.id}`)
                                            }
                                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            <Eye className="size-4" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {filteredApplications.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-500">
                            {applications.length === 0 ? "No provider applications found" : "No applications match your search or filters"}
                        </p>
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                    <p className="text-sm text-slate-500">
                        Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex-items-center gap-2">
                        <button 
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => 
                                setCurrentPage((page) => page -1)
                            }
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous

                        </button>

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => 
                                setCurrentPage((page) => page + 1)
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

export default ProviderApplicationsPage;