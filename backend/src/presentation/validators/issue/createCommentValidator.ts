import { z } from "zod";
import { ISSUE_COMMENT_LIMITS } from "../../../shared/constants/issueComment.constants.js";

export const createCommentValidator = z.object({
    body: z
        .string({ message: "Comment body is required" })
        .trim()
        .min(ISSUE_COMMENT_LIMITS.MIN_LENGTH, "Comment body cannot be empty")
        .max(
            ISSUE_COMMENT_LIMITS.MAX_LENGTH,
            `Comment exceeds maximum length of ${ISSUE_COMMENT_LIMITS.MAX_LENGTH} characters`
        ),
});
