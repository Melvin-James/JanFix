import { z } from "zod";

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

export const budgetItemFormSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, "Budget item heading is required")
    .max(100, "Heading cannot exceed 100 characters"),
  amountRupees: z
    .number({
      error: "Amount is required and must be a number",
    })
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount exceeds maximum limit (₹1 Crore)")
    .refine(
      (val) => {
        const decimals = val.toString().split(".")[1];
        return !decimals || decimals.length <= 2;
      },
      { message: "Amount can have at most two decimal places" }
    ),
});

export const roadmapItemFormSchema = z
  .object({
    heading: z
      .string()
      .trim()
      .min(1, "Activity heading is required")
      .max(100, "Heading cannot exceed 100 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Activity description is required")
      .max(1000, "Description cannot exceed 1000 characters"),
    startTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format (e.g. 08:30)"),
    endTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format (e.g. 10:00)"),
  })
  .refine(
    (data) => {
      const startMin = parseTimeToMinutes(data.startTime);
      const endMin = parseTimeToMinutes(data.endTime);
      return endMin > startMin;
    },
    {
      message: "End time must be later than start time",
      path: ["endTime"],
    }
  );

export const proposalFormSchema = z
  .object({
    estimatedTeamSize: z
      .number({
        error: "Team size is required",
      })
      .int("Team size must be a whole number")
      .positive("Team size must be at least 1 person"),
    estimatedDurationHours: z
      .number({
        error: "Estimated duration is required",
      })
      .positive("Estimated duration must be greater than 0 hours")
      .max(500, "Duration must be reasonable (maximum 500 hours)"),
    expectedStartDate: z
      .string()
      .min(1, "Expected start date is required")
      .refine(
        (val) => {
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          // Must be tomorrow or later in local date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const chosen = new Date(date);
          chosen.setHours(0, 0, 0, 0);
          return chosen.getTime() > today.getTime();
        },
        { message: "Expected start date must be a future date (starting tomorrow or later)" }
      ),
    budgetItems: z
      .array(budgetItemFormSchema)
      .min(1, "At least one budget item is required"),
    executionRoadmap: z
      .array(roadmapItemFormSchema)
      .min(1, "At least one roadmap item is required"),
    // NGO specific conditional fields
    isNgo: z.boolean().optional(),
    requiresFunding: z.boolean().optional(),
    participationMode: z.enum(["TEAM_ONLY", "OPEN_COMMUNITY"]).optional(),
    expectedParticipants: z.number().int().positive().optional(),
    requiresCommunityChat: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Roadmap Overlap Check
    if (data.executionRoadmap && data.executionRoadmap.length > 1) {
      const sorted = [...data.executionRoadmap]
        .map((item, index) => ({
          ...item,
          index,
          startMin: parseTimeToMinutes(item.startTime),
          endMin: parseTimeToMinutes(item.endTime),
        }))
        .sort((a, b) => a.startMin - b.startMin);

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i]!;
        const next = sorted[i + 1]!;
        if (current.endMin > next.startMin) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Roadmap schedule conflict: "${current.heading}" (${current.startTime} - ${current.endTime}) overlaps with "${next.heading}" (${next.startTime} - ${next.endTime})`,
            path: ["executionRoadmap"],
          });
          break;
        }
      }
    }

    // 2. NGO Conditional Validations
    if (data.isNgo) {
      if (typeof data.requiresFunding !== "boolean") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please indicate whether funding from JanFix is required",
          path: ["requiresFunding"],
        });
      }
      if (!data.participationMode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a community participation mode",
          path: ["participationMode"],
        });
      } else if (data.participationMode === "OPEN_COMMUNITY") {
        if (
          data.expectedParticipants === undefined ||
          isNaN(data.expectedParticipants) ||
          data.expectedParticipants <= 0 ||
          !Number.isInteger(data.expectedParticipants)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expected community participant capacity must be a positive integer",
            path: ["expectedParticipants"],
          });
        }
      }
      if (typeof data.requiresCommunityChat !== "boolean") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please indicate whether community chat is requested",
          path: ["requiresCommunityChat"],
        });
      }
    }
  });

export type ProposalFormData = z.infer<typeof proposalFormSchema>;
export type BudgetItemFormData = z.infer<typeof budgetItemFormSchema>;
export type RoadmapItemFormData = z.infer<typeof roadmapItemFormSchema>;

