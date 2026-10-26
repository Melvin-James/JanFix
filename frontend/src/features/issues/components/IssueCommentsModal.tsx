import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  MessageSquare,
  Send,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  ShieldCheck,
} from "lucide-react";
import type { Issue, IssueComment } from "../types/issue";
import { useAuthStore } from "../../../store/authStore";
import { getIssueComments, createIssueComment } from "../services/issueService";
import {
  isIssueInteractionOpen,
  formatInteractionTimeRemaining,
} from "../utils/issueEligibility";
import { formatRelativeTime } from "../../../utils/date";

export interface IssueCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue;
  onCommentCountChange?: (newCount: number) => void;
}

const MAX_COMMENT_LENGTH = 1000;

export const IssueCommentsModal: React.FC<IssueCommentsModalProps> = ({
  isOpen,
  onClose,
  issue,
  onCommentCountChange,
}) => {
  const user = useAuthStore((state) => state.user);

  const [comments, setComments] = useState<IssueComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isInteractionOpen = isIssueInteractionOpen(issue.createdAt);
  const timeRemaining = formatInteractionTimeRemaining(issue.createdAt);

  // Fetch comments helper for manual actions (pagination, retries, comment post)
  const loadComments = useCallback(
    async (targetPage = 1) => {
      if (!issue.id) return;
      setLoading(true);
      setFetchError(null);

      try {
        const response = await getIssueComments(issue.id, targetPage, pageSize);
        setComments(response.comments || []);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        onCommentCountChange?.(response.pagination.totalItems);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load comments. You may not have permission to view them.";
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    },
    [issue.id, pageSize, onCommentCountChange]
  );

  // Load initial comments when modal opens or issue changes
  useEffect(() => {
    if (!isOpen || !issue.id) return;
    let isMounted = true;

    getIssueComments(issue.id, 1, pageSize)
      .then((response) => {
        if (!isMounted) return;
        setComments(response.comments || []);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        onCommentCountChange?.(response.pagination.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load comments. You may not have permission to view them.";
        setFetchError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, issue.id, pageSize, onCommentCountChange]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError("You must be logged in to post a comment");
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed) {
      setSubmitError("Comment body cannot be empty");
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmitError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    if (!isInteractionOpen) {
      setSubmitError("The 24-hour community interaction window has closed");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await createIssueComment(issue.id, { body: trimmed });
      setDraft("");
      setSubmitSuccess("Comment posted successfully!");

      // Refresh to newest page / list
      await loadComments(1);

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to post comment. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comments-modal-title"
    >
      <div className="relative my-8 flex flex-col h-[90vh] max-h-[750px] w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="comments-modal-title" className="text-lg font-bold text-slate-900 truncate">
                Comments
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {issue.title || "Civic Issue Discussion"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 24h deadline indicator badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                isInteractionOpen
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{timeRemaining.text}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close comments"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm">Loading discussion...</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3 my-6">
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
              <p className="text-sm font-medium text-red-800">{fetchError}</p>
              <button
                type="button"
                onClick={() => loadComments(page)}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">No comments yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  {isInteractionOpen
                    ? "Be the first to share an update, constructive feedback, or local details."
                    : "The 24-hour interaction period for this issue has concluded."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {comments.map((comment) => {
                const isReporter = comment.author.id === issue.createdBy;
                const isCurrentUser = user?.id && comment.author.id === user.id;

                return (
                  <div
                    key={comment.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      isCurrentUser
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                          {comment.author.fullName ? comment.author.fullName.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {comment.author.fullName || "Community Member"}
                        </span>

                        {isReporter && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Reporter</span>
                          </span>
                        )}

                        {isCurrentUser && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            You
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words pl-8">
                      {comment.body}
                    </p>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Pagination Bar (when multiple pages exist) */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-2.5 bg-slate-50/50 text-xs text-slate-500">
            <span>
              Showing {comments.length} of {totalItems} comments
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadComments(page - 1)}
                className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadComments(page + 1)}
                className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer / Comment Input */}
        <div className="border-t border-slate-200 p-4 bg-white">
          {submitSuccess && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {isInteractionOpen ? (
            <form onSubmit={handleSubmitComment} className="space-y-2">
              <div className="relative">
                <textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={MAX_COMMENT_LENGTH}
                  rows={3}
                  placeholder={
                    user
                      ? "Share relevant updates, photos, or observations regarding this civic issue..."
                      : "Please log in to participate in the discussion"
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {draft.length} / {MAX_COMMENT_LENGTH} characters
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !draft.trim() || !user}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
              <Clock className="h-4 w-4 shrink-0 text-slate-500" />
              <span>
                The 24-hour community interaction window has closed. New comments can no longer be submitted. Existing comments remain viewable.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCommentsModal;
