import { z } from "zod";

export const verifyResetOtpSchema = z.object({

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),

});