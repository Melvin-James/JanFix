import z from "zod";

export const forgotPasswordSchema = z.object({

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),
        
})