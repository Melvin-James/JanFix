import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  PlusCircle,
  Calendar,
  Lock,
  Globe,
  Tag,
  AlertCircle,
} from "lucide-react";
import { getMyReports, getIssueCategories } from "../services/profileService";
import type { Issue } from "../../issues/types/issue";
import type { CategoryItem, PaginationMetadata } from "../types/profile";
import Table from "../../../components/UI/Table";
import StatusBadge from "../../../components/UI/StatusBadge";
import Pagination from "../../../components/UI/Pagination";
import FilterSelect from "../../../components/UI/FilterSelect";
import SearchBar from "../../../components/UI/SearchBar";
import LoadingState from "../../../components/UI/LoadingState";
import EmptyState from "../../../components/UI/EmptyState";
import ErrorState from "../../../components/UI/ErrorState";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "REPORTED", label: "Reported" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

const VISIBILITY_OPTIONS = [
  { value: "ALL", label: "All Visibilities" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

export function YourReportsPage() {
  const [reports, setReports] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load categories once
  useEffect(() => {
    getIssueCategories()
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.warn("Failed to load categories:", err));
  }, []);

  // Fetch reports when filters or page changes
  const fetchReports = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyReports({
          page: pageToFetch,
          pageSize: 10,
          status: statusFilter,
          visibility: visibilityFilter,
          category: categoryFilter,
          search: debouncedSearch.trim() || undefined,
        });

        if (response.success) {
          setReports(response.issues || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load your civic reports. Please try again.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, visibilityFilter, categoryFilter, debouncedSearch]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      await Promise.resolve();
      if (!ignore) {
        fetchReports(1);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchReports]);

  const handlePageChange = (newPage: number) => {
    fetchReports(newPage);
  };

  const categoryOptions = [
    { value: "ALL", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns = [
    { header: "Issue Title", align: "left" as const },
    { header: "Category", align: "left" as const },
    { header: "Status", align: "center" as const },
    { header: "Visibility", align: "center" as const },
    { header: "Reported Date", align: "left" as const },
    { header: "Actions", align: "right" as const },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and track all civic issues reported by your account.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reports by title..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              className="w-full"
            />
          </div>

          {/* Visibility Filter */}
          <div>
            <FilterSelect
              value={visibilityFilter}
              onChange={setVisibilityFilter}
              options={VISIBILITY_OPTIONS}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Reports Table & List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="py-16">
            <LoadingState message="Loading your civic reports..." />
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center">
            <ErrorState message={error} />
            <button
              type="button"
              onClick={() => fetchReports(pagination.page)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              message={
                searchQuery || statusFilter !== "ALL" || visibilityFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "No civic reports match your filter criteria. Try resetting your filters."
                  : "You haven't reported any civic issues yet. Click 'Report New Issue' to get started."
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table columns={columns}>
                {reports.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Description */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs xl:max-w-md">
                        <Link
                          to={`/issues/${issue.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {issue.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {issue.description}
                        </p>
                        {issue.status === "REJECTED" && issue.rejectionReason && (
                          <div className="mt-1 flex items-start gap-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-sm border border-red-100 max-w-sm">
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              <strong>Reason:</strong> {issue.rejectionReason}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>{issue.categoryName || "General"}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>

                    {/* Visibility */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          issue.visibility === "PRIVATE"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-blue-50 text-blue-700 border border-blue-200/60"
                        }`}
                      >
                        {issue.visibility === "PRIVATE" ? (
                          <>
                            <Lock className="h-3 w-3" /> Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" /> Public
                          </>
                        )}
                      </span>
                    </td>

                    {/* Reported Date */}
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(issue.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="divide-y divide-slate-100 md:hidden">
              {reports.map((issue) => (
                <div key={issue.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </div>

                  {issue.status === "REJECTED" && issue.rejectionReason && (
                    <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong>Rejection Reason:</strong> {issue.rejectionReason}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5">
                      <Tag className="h-3 w-3" />
                      {issue.categoryName || "General"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 ${
                        issue.visibility === "PRIVATE"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {issue.visibility === "PRIVATE" ? (
                        <>
                          <Lock className="h-3 w-3" /> Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3" /> Public
                        </>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                startIndex={(pagination.page - 1) * pagination.pageSize}
                endIndex={pagination.page * pagination.pageSize}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default YourReportsPage;
