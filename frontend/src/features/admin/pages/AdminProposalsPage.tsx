import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminFilterBar,
  AdminSearchBar,
  AdminFilterSelect,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  AdminErrorState,
  AdminIssueProposalCard,
} from "../components";
import { getIssuesWithProposals } from "../services/adminProposalService";
import { getCategories } from "../services/categoryService";
import type {
  AdminIssueProposalSummary,
  AdminProposalsSortOption,
} from "../types/adminProposalTypes";
import type { Category } from "../types/Category";

const SORT_OPTIONS = [
  { value: "proposals_desc", label: "Most Proposals" },
  { value: "proposals_asc", label: "Least Proposals" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export const AdminProposalsPage: React.FC = () => {
  const navigate = useNavigate();

  const [issues, setIssues] = useState<AdminIssueProposalSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<AdminProposalsSortOption>("proposals_desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catList = await getCategories();
        if (Array.isArray(catList)) {
          setCategories(catList);
        }
      } catch {
        // Fallback gracefully without breaking
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchIssues = async () => {
      try {
        setError("");
        const result = await getIssuesWithProposals({
          page: currentPage,
          pageSize,
          search: debouncedSearch || undefined,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          sortBy,
        });

        if (!isCancelled) {
          setIssues(result.items);
          setTotalPages(result.pagination?.totalPages || 1);
          setTotalItems(result.pagination?.totalItems || 0);
        }
      } catch {
        if (!isCancelled) {
          setError("Failed to load issues with proposals. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchIssues();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch, categoryFilter, sortBy]);

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("ALL");
    setSortBy("proposals_desc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "ALL" || sortBy !== "proposals_desc";

  const categoryOptions = [
    { value: "ALL", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Proposals Management"
        description={`Review and evaluate service provider proposals across ${totalItems} verified civic ${
          totalItems === 1 ? "issue" : "issues"
        }.`}
      />

      {/* Filter and Search Bar */}
      <AdminCard className="p-4">
        <AdminFilterBar>
          <div className="w-full sm:w-72">
            <AdminSearchBar
              value={search}
              onChange={(val) => setSearch(val)}
              placeholder="Search by issue title..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <AdminFilterSelect
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
              options={categoryOptions}
            />

            <AdminFilterSelect
              value={sortBy}
              onChange={(val) => {
                setSortBy(val as AdminProposalsSortOption);
                setCurrentPage(1);
              }}
              options={SORT_OPTIONS}
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </AdminFilterBar>
      </AdminCard>

      {/* Content Area */}
      {loading ? (
        <AdminLoadingState message="Loading issues with submitted proposals..." />
      ) : error ? (
        <AdminErrorState message={error} />
      ) : issues.length === 0 ? (
        <AdminCard>
          <AdminEmptyState
            message={
              hasActiveFilters
                ? "No issues match the applied filters."
                : "No civic issues currently have submitted provider proposals."
            }
          />
        </AdminCard>
      ) : (
        <div className="space-y-6">
          {/* Issue Cards Grid - 4 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {issues.map((issue) => (
              <AdminIssueProposalCard
                key={issue.issueId}
                issue={issue}
                onReview={(issueId) =>
                  navigate(`/admin/proposals/issues/${issueId}`)
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2">
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProposalsPage;
