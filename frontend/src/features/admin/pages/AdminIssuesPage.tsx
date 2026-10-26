import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  ThumbsUp,
  MessageSquare,
  Lock,
  Globe,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
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
  AdminActionButton,
  StatusBadge,
  ConfirmationModal,
  RejectReasonModal,
} from "../components";
import {
  getAdminReviewIssues,
  approveIssue,
  rejectIssue,
} from "../services/adminService";
import { getActiveIssueCategories } from "../../issues/services/issueService";
import type { AdminIssueListItem } from "../types/AdminIssue";
import type { Category } from "../types/Category";
import { formatRelativeTime } from "../../../utils/date";

export function AdminIssuesPage() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState<AdminIssueListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Moderation state
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    issue: AdminIssueListItem | null;
  }>({
    isOpen: false,
    issue: null,
  });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    issue: AdminIssueListItem | null;
    reason: string;
    error: string;
  }>({
    isOpen: false,
    issue: null,
    reason: "",
    error: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // Load active categories for filter dropdown
  useEffect(() => {
    let isMounted = true;
    getActiveIssueCategories()
      .then((catList) => {
        if (isMounted) setCategories(catList);
      })
      .catch((err) => {
        console.error("Failed to load categories for issue filter:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch review-eligible issues from backend
  useEffect(() => {
    let cancelled = false;

    const fetchIssues = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminReviewIssues({
          page: currentPage,
          pageSize: itemsPerPage,
          search: debouncedSearch || undefined,
          category: categoryFilter,
          status: statusFilter,
          visibility: visibilityFilter,
        });

        if (cancelled) return;

        setIssues(response.items);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load issues for admin review.";
        setError(msg);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchIssues();

    return () => {
      cancelled = true;
    };
  }, [currentPage, debouncedSearch, categoryFilter, statusFilter, visibilityFilter, refreshKey]);

  // Handle Approve Confirmation
  const handleConfirmApprove = async () => {
    if (!approveModal.issue) return;
    const issueId = approveModal.issue.id;

    try {
      setIsSubmitting(true);
      setActionError("");
      const response = await approveIssue(issueId);

      setApproveModal({ isOpen: false, issue: null });
      setActionSuccess(response.message || "Issue approved successfully.");

      // If the last item on the page was removed, navigate back a page
      if (issues.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to approve issue. Please try again.";
      setActionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reject Confirmation
  const handleConfirmReject = async () => {
    if (!rejectModal.issue) return;
    const issueId = rejectModal.issue.id;
    const trimmedReason = rejectModal.reason.trim();

    if (!trimmedReason) {
      setRejectModal((prev) => ({
        ...prev,
        error: "Rejection reason cannot be empty.",
      }));
      return;
    }

    if (trimmedReason.length > 1000) {
      setRejectModal((prev) => ({
        ...prev,
        error: "Rejection reason cannot exceed 1000 characters.",
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");
      const response = await rejectIssue(issueId, trimmedReason);

      setRejectModal({
        isOpen: false,
        issue: null,
        reason: "",
        error: "",
      });
      setActionSuccess(response.message || "Issue rejected successfully.");

      // If the last item on the page was removed, navigate back a page
      if (issues.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to reject issue. Please try again.";
      setActionError(msg);
      setRejectModal((prev) => ({ ...prev, error: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <AdminLoadingState message="Loading review-eligible issues..." />;
  }

  if (error && issues.length === 0) {
    return <AdminErrorState message={error} />;
  }

  const categoryOptions = [
    { value: "ALL", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions = [
    { value: "ALL", label: "All Review Statuses" },
    { value: "REPORTED", label: "Reported" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const visibilityOptions = [
    { value: "ALL", label: "All Issues" },
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private" },
  ];

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Issue Review Queue"
        description="Review community civic issues that have completed their 24-hour interaction period and are ready for administrative action."
      />

      {/* Global Action Feedback Alerts */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {actionError && !approveModal.isOpen && !rejectModal.isOpen && (
        <div className="flex items-center justify-between rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <AdminCard>
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">Pending Review Issues</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Showing {issues.length} of {totalItems} eligible issues
                {loading && !initialLoading && (
                  <span className="ml-2 text-blue-600 animate-pulse">
                    Refreshing...
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Enforcing 24h Interaction Rule</span>
            </div>
          </div>

          <AdminFilterBar>
            <div className="flex-1 min-w-[240px]">
              <AdminSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search issues by title or description..."
              />
            </div>

            <AdminFilterSelect
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                setCurrentPage(1);
              }}
              options={categoryOptions}
            />

            <AdminFilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />

            <AdminFilterSelect
              value={visibilityFilter}
              onChange={(value) => {
                setVisibilityFilter(value);
                setCurrentPage(1);
              }}
              options={visibilityOptions}
            />
          </AdminFilterBar>
        </div>

        <AdminTable
          columns={[
            "Issue",
            "Category",
            "Reporter",
            "Location",
            "Community Signals",
            "Status",
            "Reported Date",
            { header: "Actions", align: "right" },
          ]}
          minWidth="min-w-[1050px]"
        >
          {issues.map((issue) => {
            const hasImage = issue.images && issue.images.length > 0 && issue.images[0]?.url;
            const locationText =
              issue.location?.locality ||
              issue.location?.city ||
              issue.location?.address ||
              "Location provided";

            // Backend permits decisions only on pending review statuses
            const canDecide = issue.status === "REPORTED";

            return (
              <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Issue title and preview */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 max-w-sm">
                    {hasImage ? (
                      <img
                        src={issue.images[0]?.url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {issue.title}
                        </span>
                        {issue.visibility === "PRIVATE" ? (
                          <span title="Private Issue">
                            <Lock className="h-3 w-3 shrink-0 text-amber-600" />
                          </span>
                        ) : (
                          <span title="Public Issue">
                            <Globe className="h-3 w-3 shrink-0 text-blue-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100/60">
                    {issue.category?.name || "General"}
                  </span>
                </td>

                {/* Reporter */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {issue.reporter?.fullName || "Anonymous"}
                    </p>
                    {issue.reporter?.email && (
                      <p className="text-xs text-slate-400">
                        {issue.reporter.email}
                      </p>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[180px] truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{locationText}</span>
                  </div>
                </td>

                {/* Community Signals */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1" title={`${issue.upvoteCount} community upvotes`}>
                      <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                      <span>{issue.upvoteCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1" title={`${issue.commentCount} comments`}>
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                      <span>{issue.commentCount}</span>
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={issue.status} />
                </td>

                {/* Reported Date */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-slate-700">
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(issue.createdAt)}
                    </p>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canDecide && (
                      <>
                        <AdminActionButton
                          onClick={() => {
                            setApproveModal({ isOpen: true, issue });
                            setActionError("");
                          }}
                          disabled={isSubmitting}
                          variant="success"
                          icon={<CheckCircle2 className="size-4" />}
                          label="Approve"
                          title="Approve this civic issue"
                        />
                        <AdminActionButton
                          onClick={() => {
                            setRejectModal({
                              isOpen: true,
                              issue,
                              reason: "",
                              error: "",
                            });
                            setActionError("");
                          }}
                          disabled={isSubmitting}
                          variant="danger"
                          icon={<XCircle className="size-4" />}
                          label="Reject"
                          title="Reject this civic issue with a reason"
                        />
                      </>
                    )}

                    <AdminActionButton
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      icon={<Eye className="size-4" />}
                      label="View Details"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>

        {issues.length === 0 && !loading && (
          <AdminEmptyState
            message={
              debouncedSearch ||
              categoryFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              visibilityFilter !== "ALL"
                ? "No review-eligible issues match your search or filter criteria"
                : "No issues are currently pending admin review. Issues become eligible after their community interaction period."
            }
          />
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </AdminCard>

      {/* Confirmation Modal for Issue Approval */}
      <ConfirmationModal
        isOpen={approveModal.isOpen}
        title="Approve Civic Issue"
        message={
          approveModal.issue
            ? `Are you sure you want to approve "${approveModal.issue.title}"? This will advance the status to VERIFIED and forward it for civic resolution.`
            : "Are you sure you want to approve this issue?"
        }
        confirmLabel="Confirm Approval"
        cancelLabel="Cancel"
        loadingLabel="Approving..."
        variant="primary"
        isLoading={isSubmitting}
        errorMessage={actionError}
        onConfirm={handleConfirmApprove}
        onClose={() => {
          if (!isSubmitting) {
            setApproveModal({ isOpen: false, issue: null });
            setActionError("");
          }
        }}
      />

      {/* Reusable Modal for Issue Rejection with Reason */}
      <RejectReasonModal
        isOpen={rejectModal.isOpen}
        title="Reject Civic Issue"
        subtitle={
          rejectModal.issue
            ? `Provide a reason for rejecting "${rejectModal.issue.title}". The reporter will be able to see this reason.`
            : "Provide a reason for rejecting this civic issue."
        }
        placeholder="Explain why this issue is being rejected..."
        rejectionReason={rejectModal.reason}
        rejectError={rejectModal.error || actionError}
        isRejecting={isSubmitting}
        confirmButtonText="Confirm Rejection"
        cancelButtonText="Cancel"
        maxLength={1000}
        onReasonChange={(val) => {
          setRejectModal((prev) => ({ ...prev, reason: val, error: "" }));
          setActionError("");
        }}
        onClose={() => {
          if (!isSubmitting) {
            setRejectModal({
              isOpen: false,
              issue: null,
              reason: "",
              error: "",
            });
            setActionError("");
          }
        }}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}

export default AdminIssuesPage;
