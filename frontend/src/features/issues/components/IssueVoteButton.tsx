import React, { useEffect, useState, useCallback } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import type { Issue } from "../types/issue";
import { useAuthStore } from "../../../store/authStore";
import {
  addIssueUpvote,
  removeIssueUpvote,
  getIssueUpvoteStatus,
} from "../services/issueService";
import { isIssueInteractionOpen } from "../utils/issueEligibility";

export interface IssueVoteButtonProps {
  issue: Issue;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onVoteChange?: (hasUpvoted: boolean, newCount: number) => void;
}

export const IssueVoteButton: React.FC<IssueVoteButtonProps> = ({
  issue,
  size = "md",
  showLabel = true,
  className = "",
  onVoteChange,
}) => {
  const user = useAuthStore((state) => state.user);

  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check ownership
  const isOwner = Boolean(user?.id && issue.createdBy && user.id === issue.createdBy);

  // Check 24-hour interaction deadline
  const isInteractionOpen = isIssueInteractionOpen(issue.createdAt);

  // Fetch initial upvote status when issue ID or user changes
  useEffect(() => {
    let isMounted = true;
    if (!issue.id) return;

    getIssueUpvoteStatus(issue.id)
      .then((data) => {
        if (!isMounted) return;
        setHasUpvoted(Boolean(data.hasUpvoted));
        setUpvoteCount(data.upvoteCount ?? 0);
      })
      .catch((err) => {
        // If unauthenticated or private issue without permission, fail silently for status
        console.debug("Failed to fetch initial upvote status:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [issue.id, user?.id]);

  const handleVoteToggle = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!user) {
        setErrorMessage("Please log in to upvote issues");
        return;
      }

      if (isOwner) {
        setErrorMessage("You cannot upvote your own issue");
        return;
      }

      if (!isInteractionOpen && !hasUpvoted) {
        setErrorMessage("The community voting period has ended");
        return;
      }

      if (isSubmitting) return;

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        let response;
        if (hasUpvoted) {
          response = await removeIssueUpvote(issue.id);
        } else {
          response = await addIssueUpvote(issue.id);
        }

        const resolvedHasUpvoted = Boolean(response.hasUpvoted);
        const resolvedCount = response.upvoteCount;

        setHasUpvoted(resolvedHasUpvoted);
        setUpvoteCount(resolvedCount);
        onVoteChange?.(resolvedHasUpvoted, resolvedCount);
      } catch (err: unknown) {
        const serverMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to update vote. Please try again.";
        setErrorMessage(serverMsg);

        // Reconcile with actual server status
        try {
          const freshStatus = await getIssueUpvoteStatus(issue.id);
          setHasUpvoted(Boolean(freshStatus.hasUpvoted));
          setUpvoteCount(freshStatus.upvoteCount);
        } catch {
          // Revert optimistic values on failure
          setHasUpvoted(hasUpvoted);
          setUpvoteCount(upvoteCount);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, isOwner, isInteractionOpen, hasUpvoted, isSubmitting, upvoteCount, issue.id, onVoteChange]
  );

  // Compute disabled state and descriptive tooltip
  let isDisabled = isSubmitting;
  let tooltipText = hasUpvoted ? "Remove your upvote" : "Upvote this civic issue";

  if (!user) {
    tooltipText = "Log in to upvote";
  } else if (isOwner) {
    isDisabled = true;
    tooltipText = "You cannot upvote your own issue";
  } else if (!isInteractionOpen && !hasUpvoted) {
    isDisabled = true;
    tooltipText = "The voting period has ended";
  } else if (!isInteractionOpen && hasUpvoted) {
    tooltipText = "Voting period closed, but you can remove your upvote";
  }

  // Size variations
  const sizeStyles = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  // Visual states
  const activeStyles = hasUpvoted
    ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs ring-1 ring-blue-500/20"
    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300";

  const disabledStyles = isDisabled
    ? "opacity-60 cursor-not-allowed hover:bg-white hover:border-slate-200"
    : "cursor-pointer active:scale-95";

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleVoteToggle}
        title={tooltipText}
        aria-label={`${tooltipText}. Current count: ${upvoteCount}`}
        aria-pressed={hasUpvoted}
        className={`inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${sizeStyles} ${activeStyles} ${disabledStyles} ${className}`.trim()}
      >
        {isSubmitting ? (
          <Loader2 className={`${iconSizes} animate-spin text-blue-600`} />
        ) : (
          <ThumbsUp
            className={`${iconSizes} transition-transform ${
              hasUpvoted ? "fill-blue-600 text-blue-600 scale-105" : "text-slate-500"
            }`}
          />
        )}
        <span className="font-semibold tabular-nums">{upvoteCount}</span>
        {showLabel && (
          <span className="hidden sm:inline text-xs font-normal opacity-90">
            {hasUpvoted ? "Upvoted" : "Upvote"}
          </span>
        )}
      </button>

      {/* Ephemeral inline error notification */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute bottom-full left-0 mb-1 z-30 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default IssueVoteButton;
