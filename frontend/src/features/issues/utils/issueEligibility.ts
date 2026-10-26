/**
 * Community interaction window duration in milliseconds.
 *
 * PRODUCTION VALUE:
 *   24 * 60 * 60 * 1000 (24 hours = 86,400,000 ms).
 *
 * TEMPORARY TESTING CONFIGURATION:
 *   Temporarily configured to 1 minute (1 * 60 * 1000 = 60,000 ms) to make
 *   manual end-to-end testing practical without waiting a full day.
 *
 * RESTORATION INSTRUCTION:
 *   To restore to production 24-hour window before deployment, set:
 *     export const TEMPORARY_TESTING_WINDOW_MS = PRODUCTION_INTERACTION_WINDOW_MS;
 */
export const PRODUCTION_INTERACTION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TEMPORARY_TESTING_WINDOW_MS = 1 * 60 * 1000; // 1 minute (temporary test setting)

export const ISSUE_INTERACTION_WINDOW_MS = TEMPORARY_TESTING_WINDOW_MS;

/**
 * Returns the exact Date when community interactions (upvoting/commenting) close.
 */
export function getIssueInteractionDeadline(createdAt?: string | Date | null): Date | null {
  if (!createdAt) return null;
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + ISSUE_INTERACTION_WINDOW_MS);
}

/**
 * Checks whether community interactions are still open for an issue.
 * True while serverNow < createdAt + interaction window.
 */
export function isIssueInteractionOpen(
  createdAt?: string | Date | null,
  now: Date = new Date()
): boolean {
  const deadline = getIssueInteractionDeadline(createdAt);
  if (!deadline) return false;
  return now.getTime() < deadline.getTime();
}

/**
 * Formats the time remaining in the interaction period into human-readable text.
 * Displays hours, minutes, or seconds remaining so countdowns are dynamic and visible.
 */
export function formatInteractionTimeRemaining(
  createdAt?: string | Date | null,
  now: Date = new Date()
): { isOpen: boolean; text: string } {
  const deadline = getIssueInteractionDeadline(createdAt);
  if (!deadline) {
    return { isOpen: false, text: "Interaction closed" };
  }

  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { isOpen: false, text: "Interaction closed" };
  }

  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return {
      isOpen: true,
      text: `${hours}h ${minutes}m left to interact`,
    };
  }

  if (minutes > 0) {
    return {
      isOpen: true,
      text: `${minutes}m ${seconds}s left to interact`,
    };
  }

  return {
    isOpen: true,
    text: `${seconds}s left to interact`,
  };
}
