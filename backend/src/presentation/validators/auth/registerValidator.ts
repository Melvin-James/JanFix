import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters")
        .regex(
            /^[A-Za-z\s]+$/,
            "Name can only contain alphabets and spaces"
        ),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(20, "Password cannot exceed 20 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
        )
        .regex(
            /[0-9]/,
            "Password must contain at least one number"
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),
});