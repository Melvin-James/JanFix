import React, { useEffect, useState, useCallback } from "react";
import { Users, X, RotateCcw, Sparkles } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { IssueCard } from "../components/IssueCard";
import { SearchBar } from "../../../components/UI/SearchBar";
import { FilterSelect } from "../../../components/UI/FilterSelect";
import { Pagination } from "../../../components/UI/Pagination";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { getCommunityActivities, getActiveIssueCategories } from "../services/issueService";
import type { Issue } from "../types/issue";
import type { Category } from "../../admin/types/Category";

export const CommunityActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

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
        console.error("Failed to load active categories for activities filter", err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch community activities
  const fetchActivities = useCallback(() => {
    setLoading(true);
    setError("");
    getCommunityActivities({
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
    })
      .then((response) => {
        setActivities(response.issues);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch community activities", err);
        setError("Unable to load community activities. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    let isMounted = true;
    getCommunityActivities({
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
    })
      .then((response) => {
        if (!isMounted) return;
        setActivities(response.issues);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error("Failed to fetch community activities", err);
        setError("Unable to load community activities. Please try again.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, selectedStatus]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedCategory || selectedStatus
  );

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Fundraising", value: "FUNDRAISING" },
    { label: "Planned", value: "PLANNED" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
  ];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Hero Info */}
        <div className="rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 via-teal-50 to-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-semibold shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Civic Engagement</span>
                </span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Volunteer & Participate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Community Activities
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Civic projects with open participation where citizens, NGOs, and community volunteers collaborate on-the-ground to solve local challenges.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-white/80 backdrop-blur-xs border border-emerald-200/60 rounded-xl p-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
                <p className="text-xs font-medium text-slate-500">Active Activities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search activities by title, description or keywords..."
                className="w-full"
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
            <div className="md:col-span-3">
              <FilterSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                options={statusOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Filter Indicators & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                {loading
                  ? "Loading activities..."
                  : `Showing ${activities.length} of ${totalItems} activit${totalItems === 1 ? "y" : "ies"}`}
              </span>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-medium">
                      Search: "{debouncedSearch}"
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-medium">
                      Category: {categories.find((c) => c.id === selectedCategory)?.name || "Selected"}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange("")}
                        className="hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-medium">
                      Status: {selectedStatus}
                      <button
                        type="button"
                        onClick={() => handleStatusChange("")}
                        className="hover:text-emerald-900 cursor-pointer"
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
                className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
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
            <LoadingState message="Discovering community activities..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-xs text-center space-y-3">
            <ErrorState message={error} />
            <button
              type="button"
              onClick={fetchActivities}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No community activities found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {hasActiveFilters
                ? "No community activities match your selected filters. Try broadening your search or resetting filters."
                : "There are currently no civic projects marked for open community participation. Check back soon as new provider proposals are selected!"}
            </p>
            {hasActiveFilters && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <IssueCard key={activity.id} issue={activity} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CommunityActivitiesPage;
