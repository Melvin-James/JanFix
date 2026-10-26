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
 *   or provide the environment variable ISSUE_INTERACTION_WINDOW_MS=86400000.
 */
export const PRODUCTION_INTERACTION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TEMPORARY_TESTING_WINDOW_MS = 1 * 60 * 1000; // 1 minute (temporary test setting)

export const ISSUE_INTERACTION_WINDOW_MS = process.env.ISSUE_INTERACTION_WINDOW_MS
    ? Number(process.env.ISSUE_INTERACTION_WINDOW_MS)
    : TEMPORARY_TESTING_WINDOW_MS;

/**
 * Returns the exact server timestamp when community interactions (upvotes and comments)
 * close and admin review eligibility begins.
 */
export function getIssueInteractionDeadline(createdAt: Date): Date {
    return new Date(new Date(createdAt).getTime() + ISSUE_INTERACTION_WINDOW_MS);
}

/**
 * Checks whether an issue is still open for community upvotes and comments.
 * Interaction is open strictly when serverNow < createdAt + 24 hours.
 */
export function isIssueInteractionOpen(createdAt: Date, serverNow: Date = new Date()): boolean {
    return serverNow.getTime() < getIssueInteractionDeadline(createdAt).getTime();
}

/**
 * Checks whether an issue is eligible for admin review.
 * Eligibility begins strictly when serverNow >= createdAt + 24 hours.
 */
export function isIssueEligibleForReview(createdAt: Date, serverNow: Date = new Date()): boolean {
    return serverNow.getTime() >= getIssueInteractionDeadline(createdAt).getTime();
}

/**
 * Returns the maximum creation date for an issue to be eligible for admin review.
 * In a database query: { createdAt: { $lte: getReviewEligibilityThreshold(serverNow) } }
 */
export function getReviewEligibilityThreshold(serverNow: Date = new Date()): Date {
    return new Date(serverNow.getTime() - ISSUE_INTERACTION_WINDOW_MS);
}
