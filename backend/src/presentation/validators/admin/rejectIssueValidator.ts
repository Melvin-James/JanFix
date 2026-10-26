import { z } from "zod";

export const rejectIssueSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(1, "Rejection reason cannot be empty")
        .max(1000, "Rejection reason cannot exceed 1000 characters"),
});
