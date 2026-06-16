import { z } from "zod";

export const verifyOtpSchema =

  z.object({

    otp: z

      .string()

      .trim()

      .length(
        6,
        "OTP must be 6 digits"
      ),
  });

  export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;