export const ApplicationStatus = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApplicationStatus =
  typeof ApplicationStatus[keyof typeof ApplicationStatus];
