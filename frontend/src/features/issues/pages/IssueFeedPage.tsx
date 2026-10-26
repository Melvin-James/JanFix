import React, { useEffect, useState, useCallback } from "react";
import { Plus, X, RotateCcw } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { IssueCard } from "../components/IssueCard";
import { SearchBar } from "../../../components/UI/SearchBar";
import { FilterSelect } from "../../../components/UI/FilterSelect";
import { Pagination } from "../../../components/UI/Pagination";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { ReportIssueModal } from "../components/ReportIssueModal";
import { getFeedIssues, getActiveIssueCategories } from "../services/issueService";
import type { Issue } from "../types/issue";
import type { Category } from "../../admin/types/Category";

export const IssueFeedPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Load active categories for filter dropdown
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const catList = await getActiveIssueCategories();
        if (isMounted) {
          setCategories(catList);
        }
      } catch (err) {
        console.error("Failed to load active categories for feed filter", err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch feed issues helper for manual refresh / retries
  const fetchIssues = useCallback(() => {
    setLoading(true);
    setError("");
    getFeedIssues({
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      visibility: selectedVisibility || undefined,
    })
      .then((response) => {
        setIssues(response.issues);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch feed issues", err);
        setError("Unable to load community issues. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, selectedStatus, selectedVisibility]);

  useEffect(() => {
    let isMounted = true;
    getFeedIssues({
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      visibility: selectedVisibility || undefined,
    })
      .then((response) => {
        if (!isMounted) return;
        setIssues(response.issues);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error("Failed to fetch feed issues", err);
        setError("Unable to load community issues. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, selectedStatus, selectedVisibility]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleVisibilityChange = (val: string) => {
    setSelectedVisibility(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedVisibility("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedCategory || selectedStatus || selectedVisibility
  );

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "REPORTED", label: "Reported" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const visibilityOptions = [
    { value: "", label: "All Visibilities" },
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private (Mine)" },
  ];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Community Issues
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Explore civic issues reported in your community and track their real-time progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Report an Issue</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search issues by title or description..."
                className="w-full bg-slate-50/50"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <FilterSelect
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={categoryOptions}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <FilterSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                options={statusOptions}
                className="w-full"
              />
            </div>

            {/* Visibility Filter */}
            <div className="md:col-span-2">
              <FilterSelect
                value={selectedVisibility}
                onChange={handleVisibilityChange}
                options={visibilityOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Filter Indicators & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                {loading
                  ? "Loading results..."
                  : `Showing ${issues.length} of ${totalItems} issue${totalItems === 1 ? "" : "s"}`}
              </span>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                      Search: "{debouncedSearch}"
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                      Category: {categories.find((c) => c.id === selectedCategory)?.name || "Selected"}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange("")}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                      Status: {selectedStatus}
                      <button
                        type="button"
                        onClick={() => handleStatusChange("")}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedVisibility && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                      Visibility: {selectedVisibility}
                      <button
                        type="button"
                        onClick={() => handleVisibilityChange("")}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-16">
            <LoadingState message="Fetching community issues..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-xs text-center space-y-3">
            <ErrorState message={error} />
            <button
              type="button"
              onClick={fetchIssues}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <h3 className="text-base font-semibold text-slate-900">No issues found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No reported civic issues match your selected filters. Try broadening your search or resetting filters."
                : "No civic issues have been reported yet in this area. Be the first to report an issue!"}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Report an Issue
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 4 Cards per row on wide screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {/* Pagination */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={(currentPage - 1) * pageSize}
                endIndex={Math.min(currentPage * pageSize, totalItems)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )}

        {/* Report Issue Modal */}
        {isReportModalOpen && (
          <ReportIssueModal
            isOpen={true}
            onClose={() => setIsReportModalOpen(false)}
            onSuccess={() => {
              setIsReportModalOpen(false);
              fetchIssues();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default IssueFeedPage;
