import { z } from "zod";

const budgetItemInputSchema = z.object({
    heading: z
        .string()
        .trim()
        .min(1, "Budget item heading is required")
        .max(100, "Budget item heading cannot exceed 100 characters"),
    amountRupees: z
        .coerce
        .number()
        .positive("Amount must be greater than 0")
        .optional(),
    amountPaise: z
        .coerce
        .number()
        .positive("Amount must be greater than 0")
        .optional(),
}).refine(
    (data) => (data.amountRupees !== undefined && data.amountRupees > 0) || (data.amountPaise !== undefined && data.amountPaise > 0),
    { message: "A positive amount in rupees or paise is required", path: ["amountRupees"] }
);

const roadmapItemInputSchema = z.object({
    heading: z
        .string()
        .trim()
        .min(1, "Roadmap activity heading is required")
        .max(100, "Activity heading cannot exceed 100 characters"),
    description: z
        .string()
        .trim()
        .min(1, "Roadmap activity description is required")
        .max(1000, "Activity description cannot exceed 1000 characters"),
    startTime: z
        .string()
        .trim()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:mm format (e.g. 08:30)"),
    endTime: z
        .string()
        .trim()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be in HH:mm format (e.g. 10:00)"),
    order: z.coerce.number().optional(),
});

const ngoDetailsInputSchema = z.object({
    requiresFunding: z.boolean({
        error: "Please specify whether funding is required",
    }),
    participationMode: z.enum(["TEAM_ONLY", "OPEN_COMMUNITY"], {
        error: "Participation mode must be TEAM_ONLY or OPEN_COMMUNITY",
    }),
    expectedParticipants: z.coerce.number().int().positive("Expected participants must be a positive integer").optional(),
    requiresCommunityChat: z.boolean({
        error: "Please specify whether community chat is requested",
    }),
});

export const submitProposalSchema = z.object({
    estimatedTeamSize: z
        .coerce
        .number()
        .int("Team size must be an integer")
        .positive("Team size must be at least 1 person"),
    estimatedDurationHours: z
        .coerce
        .number()
        .positive("Duration must be greater than 0 hours"),
    expectedStartDate: z
        .string()
        .min(1, "Expected start date is required")
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format for start date" }),
    budgetItems: z
        .array(budgetItemInputSchema)
        .min(1, "At least one budget item is required"),
    executionRoadmap: z
        .array(roadmapItemInputSchema)
        .min(1, "At least one roadmap item is required"),
    ngoDetails: ngoDetailsInputSchema.optional(),
});

export const updateProposalSchema = submitProposalSchema.partial();

