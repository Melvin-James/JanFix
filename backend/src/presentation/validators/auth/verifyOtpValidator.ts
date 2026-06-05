import { z } from "zod";

export const verifyOtpSchema = z.object({

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  otp: z
    .string()
    .length(6, "OTP must be 6 digits"),

});