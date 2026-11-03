import { z } from "zod";

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,64}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;
const NAME_REGEX = /^[a-zA-Z\s.'-]+$/;

export const activateProviderSchema = z
    .object({
        accountHolderName: z
            .string()
            .trim()
            .min(1, "Account holder name is required")
            .min(2, "Account holder name must be at least 2 characters")
            .max(100, "Account holder name cannot exceed 100 characters")
            .regex(NAME_REGEX, "Account holder name contains invalid characters"),

        upiId: z
            .string()
            .trim()
            .min(1, "UPI ID is required")
            .min(3, "UPI ID must be at least 3 characters")
            .max(100, "UPI ID cannot exceed 100 characters")
            .regex(UPI_REGEX, "Please enter a valid UPI ID (e.g. username@bank)"),

        bankAccountNumber: z
            .string()
            .trim()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || BANK_ACCOUNT_REGEX.test(val),
                "Bank account number must be between 9 and 18 digits"
            ),

        ifscCode: z
            .string()
            .trim()
            .optional()
            .or(z.literal(""))
            .transform((val) => (val ? val.toUpperCase() : val))
            .refine(
                (val) => !val || IFSC_REGEX.test(val),
                "Please enter a valid 11-character IFSC code (e.g. SBIN0001234)"
            ),
    })
    .superRefine((data, ctx) => {
        const hasAccount = Boolean(data.bankAccountNumber && data.bankAccountNumber.length > 0);
        const hasIfsc = Boolean(data.ifscCode && data.ifscCode.length > 0);

        if (hasAccount && !hasIfsc) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "IFSC code is required when bank account number is provided",
                path: ["ifscCode"],
            });
        }

        if (hasIfsc && !hasAccount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Bank account number is required when IFSC code is provided",
                path: ["bankAccountNumber"],
            });
        }
    });

export type ActivateProviderInput = z.infer<typeof activateProviderSchema>;
