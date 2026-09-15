import { z } from "zod";

export const verifyResetOtpSchema =

  z.object({

    otp: z

      .string()

      .trim()

      .length(
        6,
        "OTP must be 6 digits"
      ),
  });

  export type VerifyResetOtpFormData = z.infer<typeof verifyResetOtpSchema>;