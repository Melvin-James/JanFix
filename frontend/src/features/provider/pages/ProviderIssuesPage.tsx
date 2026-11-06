import { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import ProviderLayout from "../components/workspace/ProviderLayout";
import IssueCard from "../../issues/components/IssueCard";
import { Pagination } from "../../../components/UI/Pagination";
import { LoadingState } from "../../../components/UI/LoadingState";
import { ErrorState } from "../../../components/UI/ErrorState";
import { EmptyState } from "../../../components/UI/EmptyState";
import { getProviderIssues } from "../services/providerService";
import { getActiveIssueCategories } from "../../issues/services/issueService";
import type { ProviderIssue } from "../types/providerTypes";
import type { Category } from "../../admin/types/Category";
import SearchBar from "../../../components/UI/SearchBar";
import FilterSelect from "../../../components/UI/FilterSelect";

export default function ProviderIssuesPage() {
  const [issues, setIssues] = useState<ProviderIssue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedVisibility, setSelectedVisibility] = useState("ALL");
  
  const pageSize = 9;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories
  useEffect(() => {
    let mounted = true;
    getActiveIssueCategories()
      .then((cats: Category[]) => {
        if (mounted) setCategories(cats);
      })
      .catch((err: unknown) => {
        console.error("Failed to load categories for provider workspace:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [refreshCount, setRefreshCount] = useState<number>(0);

  // Fetch provider issues
  useEffect(() => {
    let mounted = true;

    const fetchIssues = async () => {
      try {
        const res = await getProviderIssues({
          page: currentPage,
          pageSize,
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          search: debouncedSearch.trim() || undefined,
          visibility: selectedVisibility !=="ALL" ? selectedVisibility : undefined
        });
        if (!mounted) return;
        setIssues(res.issues);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
        setError(null);
      } catch (err: unknown) {
        if (!mounted) return;
        console.error("Failed to load provider issues:", err);
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : "Failed to load issues. Please try again.";
        setError(message || "Failed to load issues.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchIssues();

    return () => {
      mounted = false;
    };
  }, [currentPage, selectedCategory, debouncedSearch, refreshCount, selectedVisibility]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshCount((c) => c + 1);
  }, []);



  const handleVisibilityChange = (val: string) => {
    setSelectedVisibility(val);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + issues.length;

  const visibilityOptions = [
    { value: "", label: "All Visibilities" },
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Issues
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse public verified civic issues and express interest in
              resolving community reports.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex self-start items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search issues by title or description..."
            className="bg-slate-50"
          />

          {/* Category Filter */}
          <FilterSelect
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "ALL", label: "All Categories" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            className="w-full"
          />

          <FilterSelect
            value={selectedVisibility}
            onChange={handleVisibilityChange}
            options={visibilityOptions}
            className="w-full"
          />
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <ErrorState message={error} />
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Retry</span>
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <EmptyState message="No eligible civic issues found matching your current filter criteria." />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  variant="provider"
                  issue={issue}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
